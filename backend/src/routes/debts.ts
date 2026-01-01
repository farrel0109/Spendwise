import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import { z } from 'zod';

const router = Router();

// Validation schema
const createDebtSchema = z.object({
  personName: z.string().min(1).max(100),
  personContact: z.string().max(200).optional(),
  amount: z.number().refine(val => val !== 0, { message: 'Amount cannot be zero' }), // Positive = they owe you, Negative = you owe them
  description: z.string().max(500).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reminderEnabled: z.boolean().optional().default(true),
});

// GET /api/debts - List all debts
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .order('is_settled', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch debts' });
      return;
    }

    // Calculate summary
    const activeDebts = data?.filter(d => !d.is_settled) || [];
    const theyOweYou = activeDebts.filter(d => d.amount > 0).reduce((sum, d) => sum + Number(d.amount), 0);
    const youOweThem = activeDebts.filter(d => d.amount < 0).reduce((sum, d) => sum + Math.abs(Number(d.amount)), 0);
    const netBalance = theyOweYou - youOweThem;

    // Check for overdue
    const now = new Date().toISOString().split('T')[0];
    const debtsWithStatus = data?.map(debt => ({
      ...debt,
      isOverdue: debt.due_date && debt.due_date < now && !debt.is_settled,
      paidPercentage: Math.round(((debt.original_amount - Math.abs(debt.amount)) / debt.original_amount) * 100),
    }));

    res.json({
      debts: debtsWithStatus,
      summary: {
        theyOweYou,
        youOweThem,
        netBalance,
        activeCount: activeDebts.length,
        overdueCount: debtsWithStatus?.filter(d => d.isOverdue).length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching debts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/debts - Create debt
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = createDebtSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues.map(i => i.message).join(', ') });
      return;
    }

    const { personName, personContact, amount, description, dueDate, reminderEnabled } = validation.data;

    const { data, error } = await supabase
      .from('debts')
      .insert({
        user_id: userId,
        person_name: personName,
        person_contact: personContact,
        amount,
        original_amount: Math.abs(amount),
        description,
        due_date: dueDate || null,
        reminder_enabled: reminderEnabled,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating debt:', error);
      res.status(500).json({ error: 'Failed to create debt' });
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating debt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/debts/:id/pay - Record payment
router.post('/:id/pay', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Valid payment amount is required' });
      return;
    }

    // Get current debt
    const { data: debt } = await supabase
      .from('debts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!debt) {
      res.status(404).json({ error: 'Debt not found' });
      return;
    }

    if (debt.is_settled) {
      res.status(400).json({ error: 'Debt is already settled' });
      return;
    }

    // Record payment
    await supabase
      .from('debt_payments')
      .insert({
        debt_id: id,
        amount,
        note,
      });

    // Calculate new amount
    const isPositive = debt.amount > 0;
    const currentAbs = Math.abs(debt.amount);
    const newAbs = Math.max(0, currentAbs - amount);
    const newAmount = isPositive ? newAbs : -newAbs;
    const isSettled = newAbs === 0;

    // Update debt
    const { data, error } = await supabase
      .from('debts')
      .update({
        amount: newAmount,
        is_settled: isSettled,
        settled_at: isSettled ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to record payment' });
      return;
    }

    // Award achievement if all debts settled
    if (isSettled) {
      const { data: activeDebts } = await supabase
        .from('debts')
        .select('id')
        .eq('user_id', userId)
        .eq('is_settled', false);

      if (!activeDebts || activeDebts.length === 0) {
        await supabase
          .from('achievements')
          .upsert({
            user_id: userId,
            badge_id: 'debt_free',
            earned_at: new Date().toISOString()
          }, { onConflict: 'user_id,badge_id' });
      }
    }

    res.json({
      debt: data,
      payment: { amount, note },
      isSettled
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/debts/:id/payments - Get payment history
router.get('/:id/payments', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify debt belongs to user
    const { data: debt } = await supabase
      .from('debts')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!debt) {
      res.status(404).json({ error: 'Debt not found' });
      return;
    }

    const { data, error } = await supabase
      .from('debt_payments')
      .select('*')
      .eq('debt_id', id)
      .order('paid_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch payments' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/debts/:id/settle - Mark as settled
router.patch('/:id/settle', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('debts')
      .update({
        amount: 0,
        is_settled: true,
        settled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to settle debt' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error settling debt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/debts/:id - Delete debt
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      res.status(500).json({ error: 'Failed to delete debt' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting debt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
