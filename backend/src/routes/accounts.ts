import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['cash', 'bank', 'e-wallet', 'investment', 'credit_card', 'loan']),
  icon: z.string().max(10).optional().default('💳'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#3b82f6'),
  initialBalance: z.number().optional().default(0),
  isAsset: z.boolean().optional().default(true),
  institution: z.string().max(100).optional(),
  accountNumber: z.string().max(50).optional(),
});

// GET /api/accounts - List all accounts
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch accounts' });
      return;
    }

    // Calculate totals
    const assets = data?.filter(a => a.is_asset) || [];
    const liabilities = data?.filter(a => !a.is_asset) || [];
    
    const totalAssets = assets.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + Math.abs(Number(a.balance)), 0);
    const netWorth = totalAssets - totalLiabilities;

    res.json({
      accounts: data,
      summary: {
        totalAssets,
        totalLiabilities,
        netWorth,
        accountCount: data?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/accounts - Create new account
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = createAccountSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues.map(i => i.message).join(', ') });
      return;
    }

    const { name, type, icon, color, initialBalance, isAsset, institution, accountNumber } = validation.data;

    // For liabilities (credit_card, loan), balance is stored as negative
    const balance = isAsset ? initialBalance : -Math.abs(initialBalance);

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        name,
        type,
        icon,
        color,
        balance,
        initial_balance: initialBalance,
        is_asset: isAsset,
        institution,
        account_number: accountNumber,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating account:', error);
      res.status(500).json({ error: 'Failed to create account' });
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/accounts/:id - Update account
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, icon, color, institution, accountNumber, isActive } = req.body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (icon) updates.icon = icon;
    if (color) updates.color = color;
    if (institution !== undefined) updates.institution = institution;
    if (accountNumber !== undefined) updates.account_number = accountNumber;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to update account' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/accounts/:id - Delete (deactivate) account
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Soft delete - just deactivate
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      res.status(500).json({ error: 'Failed to delete account' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/accounts/:id/adjust-balance - Manually adjust balance
router.patch('/:id/adjust-balance', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const { newBalance, reason } = req.body;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (typeof newBalance !== 'number') {
      res.status(400).json({ error: 'New balance is required' });
      return;
    }

    // Get current balance
    const { data: account } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    const difference = newBalance - Number(account.balance);

    // Create adjustment transaction
    if (difference !== 0) {
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          account_id: id,
          amount: Math.abs(difference),
          type: difference > 0 ? 'income' : 'expense',
          description: reason || 'Balance adjustment',
          txn_date: new Date().toISOString().split('T')[0],
        });
    }

    // Update balance
    const { data, error } = await supabase
      .from('accounts')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to adjust balance' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error adjusting balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
