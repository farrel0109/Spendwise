import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createBudgetSchema = z.object({
  categoryId: z.number().int().positive(),
  amount: z.number().min(1).max(999999999999),
  period: z.enum(['weekly', 'monthly', 'yearly']).optional().default('monthly'),
  alertThreshold: z.number().min(0).max(100).optional().default(80),
});

// GET /api/budgets - List all budgets with status
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        categories (id, name, color, icon)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch budgets' });
      return;
    }

    // Calculate percentage used for each budget
    const budgetsWithStatus = data?.map(budget => ({
      ...budget,
      percentUsed: Math.round((budget.spent / budget.amount) * 100),
      remaining: budget.amount - budget.spent,
      isOverBudget: budget.spent > budget.amount,
      isNearLimit: (budget.spent / budget.amount) * 100 >= budget.alert_threshold
    }));

    res.json(budgetsWithStatus);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/budgets - Create budget
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = createBudgetSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues.map(i => i.message).join(', ') });
      return;
    }

    const { categoryId, amount, period, alertThreshold } = validation.data;

    // Check if budget already exists for this category
    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .single();

    if (existing) {
      res.status(409).json({ error: 'Budget already exists for this category' });
      return;
    }

    // Calculate start date based on period
    const now = new Date();
    let startDate: string;
    
    if (period === 'weekly') {
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek + 1);
      startDate = monday.toISOString().split('T')[0];
    } else if (period === 'yearly') {
      startDate = `${now.getFullYear()}-01-01`;
    } else {
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    }

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        category_id: categoryId,
        amount,
        period,
        start_date: startDate,
        alert_threshold: alertThreshold,
      })
      .select(`
        *,
        categories (id, name, color, icon)
      `)
      .single();

    if (error) {
      console.error('Error creating budget:', error);
      res.status(500).json({ error: 'Failed to create budget' });
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/budgets/:id - Update budget
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { amount, alertThreshold } = req.body;

    const updates: Record<string, unknown> = {};
    if (amount !== undefined) updates.amount = amount;
    if (alertThreshold !== undefined) updates.alert_threshold = alertThreshold;

    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        categories (id, name, color, icon)
      `)
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to update budget' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/budgets/:id - Delete budget
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      res.status(500).json({ error: 'Failed to delete budget' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/budgets/reset - Reset all budgets for new period
router.post('/reset', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const { error } = await supabase
      .from('budgets')
      .update({ spent: 0, start_date: currentMonth })
      .eq('user_id', userId)
      .eq('period', 'monthly');

    if (error) {
      res.status(500).json({ error: 'Failed to reset budgets' });
      return;
    }

    res.json({ message: 'Budgets reset successfully' });
  } catch (error) {
    console.error('Error resetting budgets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
