import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  targetAmount: z.number().min(1).max(999999999999),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  icon: z.string().max(10).optional().default('🎯'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#22c55e'),
  priority: z.number().int().min(1).max(10).optional().default(1),
  linkedAccountId: z.string().uuid().optional(),
});

// GET /api/goals - List all savings goals
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .select(`
        *,
        linked_account:linked_account_id (id, name, icon, color)
      `)
      .eq('user_id', userId)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch goals' });
      return;
    }

    // Calculate progress for each goal
    const goalsWithProgress = data?.map(goal => {
      const progress = Math.round((goal.current_amount / goal.target_amount) * 100);
      const remaining = goal.target_amount - goal.current_amount;
      
      // Calculate estimated completion
      let estimatedCompletion = null;
      if (goal.target_date) {
        const targetDate = new Date(goal.target_date);
        const now = new Date();
        const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const dailyRequired = remaining / daysRemaining;
        estimatedCompletion = { daysRemaining, dailyRequired };
      }

      return {
        ...goal,
        progress,
        remaining,
        estimatedCompletion,
        isCompleted: goal.current_amount >= goal.target_amount
      };
    });

    res.json(goalsWithProgress);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/goals - Create savings goal
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = createGoalSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues.map(i => i.message).join(', ') });
      return;
    }

    const { name, targetAmount, targetDate, icon, color, priority, linkedAccountId } = validation.data;

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: userId,
        name,
        target_amount: targetAmount,
        target_date: targetDate || null,
        icon,
        color,
        priority,
        linked_account_id: linkedAccountId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ error: 'Failed to create goal' });
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/goals/:id/contribute - Add contribution to goal
router.post('/:id/contribute', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Valid amount is required' });
      return;
    }

    // Get current goal
    const { data: goal } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    // Record contribution
    await supabase
      .from('goal_contributions')
      .insert({
        goal_id: id,
        amount,
        note,
      });

    // Update goal current amount
    const newAmount = Number(goal.current_amount) + amount;
    const isCompleted = newAmount >= goal.target_amount;

    const { data, error } = await supabase
      .from('savings_goals')
      .update({
        current_amount: newAmount,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to update goal' });
      return;
    }

    // Award achievement if goal completed
    if (isCompleted) {
      await supabase
        .from('achievements')
        .upsert({
          user_id: userId,
          badge_id: 'goal_getter',
          earned_at: new Date().toISOString()
        }, { onConflict: 'user_id,badge_id' });
    }

    res.json({
      goal: data,
      contribution: { amount, note },
      isCompleted
    });
  } catch (error) {
    console.error('Error contributing to goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/goals/:id/contributions - Get contribution history
router.get('/:id/contributions', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify goal belongs to user
    const { data: goal } = await supabase
      .from('savings_goals')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const { data, error } = await supabase
      .from('goal_contributions')
      .select('*')
      .eq('goal_id', id)
      .order('contributed_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch contributions' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/goals/:id - Update goal
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, targetAmount, targetDate, icon, color, priority } = req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (targetAmount !== undefined) updates.target_amount = targetAmount;
    if (targetDate !== undefined) updates.target_date = targetDate;
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;
    if (priority !== undefined) updates.priority = priority;

    const { data, error } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to update goal' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/goals/:id - Delete goal
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      res.status(500).json({ error: 'Failed to delete goal' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
