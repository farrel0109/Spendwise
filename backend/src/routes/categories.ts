import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1).max(60),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#3b82f6'),
  icon: z.string().max(10).optional().default('📁'),
  type: z.enum(['income', 'expense', 'transfer']).optional().default('expense'),
});

// GET /api/categories - List all categories
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { type } = req.query;

    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (type && typeof type === 'string') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/categories - Create category
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = createCategorySchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues.map(i => i.message).join(', ') });
      return;
    }

    const { name, color, icon, type } = validation.data;

    // Check for duplicate
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .ilike('name', name.trim())
      .single();

    if (existing) {
      res.status(409).json({ error: 'Category with this name already exists' });
      return;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: name.trim(),
        color,
        icon,
        type,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/categories/:id - Update category
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, color, icon, type } = req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name.trim();
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;
    if (type !== undefined) updates.type = type;

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', parseInt(id))
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to update category' });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', parseInt(id))
      .eq('user_id', userId);

    if (error) {
      res.status(500).json({ error: 'Failed to delete category' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
