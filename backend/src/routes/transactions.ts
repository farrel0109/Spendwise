import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  toAccountId: z.string().uuid().optional(), // For transfers
  categoryId: z.number().int().positive().optional().nullable(),
  amount: z.number().min(0.01).max(999999999999),
  type: z.enum(['income', 'expense', 'transfer']),
  description: z.string().max(500).optional().default(''),
  txnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  emotion: z.string().max(10).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/transactions - List transactions with filters
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { month, accountId, categoryId, type, search, limit = '50', offset = '0' } = req.query;
    
    let query = supabase
      .from('transactions')
      .select(`
        *,
        accounts:account_id (id, name, icon, color),
        to_accounts:to_account_id (id, name, icon, color),
        categories (id, name, color, icon)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('txn_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Filter by month
    if (month && typeof month === 'string') {
      const startDate = `${month}-01`;
      const [year, monthNum] = month.split('-').map(Number);
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${month}-${lastDay}`;
      query = query.gte('txn_date', startDate).lte('txn_date', endDate);
    }

    // Filter by account
    if (accountId && typeof accountId === 'string') {
      query = query.or(`account_id.eq.${accountId},to_account_id.eq.${accountId}`);
    }

    // Filter by category
    if (categoryId && typeof categoryId === 'string') {
      query = query.eq('category_id', parseInt(categoryId));
    }

    // Filter by type
    if (type && typeof type === 'string') {
      query = query.eq('type', type);
    }

    // Search in description
    if (search && typeof search === 'string') {
      query = query.ilike('description', `%${search}%`);
    }

    // Pagination
    query = query.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
      return;
    }

    res.json({
      transactions: data,
      pagination: {
        total: count,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (count || 0) > parseInt(offset as string) + parseInt(limit as string)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/transactions - Create transaction with balance update
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const validation = createTransactionSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues.map(i => i.message).join(', ') });
      return;
    }

    const { accountId, toAccountId, categoryId, amount, type, description, txnDate, emotion, tags } = validation.data;

    // For transfers, toAccountId is required
    if (type === 'transfer' && !toAccountId) {
      res.status(400).json({ error: 'Destination account is required for transfers' });
      return;
    }

    // Start transaction: Insert transaction + update account balances
    // Step 1: Insert transaction
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        account_id: accountId,
        to_account_id: toAccountId || null,
        category_id: categoryId || null,
        amount,
        type,
        description,
        txn_date: txnDate,
        emotion,
        tags,
      })
      .select(`
        *,
        accounts:account_id (id, name, icon, color),
        to_accounts:to_account_id (id, name, icon, color),
        categories (id, name, color, icon)
      `)
      .single();

    if (txnError) {
      console.error('Error creating transaction:', txnError);
      res.status(500).json({ error: 'Failed to create transaction' });
      return;
    }

    // Step 2: Update account balance(s)
    if (type === 'income') {
      // Add to account
      await supabase.rpc('increment_balance', { account_id: accountId, delta: amount });
    } else if (type === 'expense') {
      // Subtract from account
      await supabase.rpc('increment_balance', { account_id: accountId, delta: -amount });
    } else if (type === 'transfer' && toAccountId) {
      // Subtract from source, add to destination
      await supabase.rpc('increment_balance', { account_id: accountId, delta: -amount });
      await supabase.rpc('increment_balance', { account_id: toAccountId, delta: amount });
    }

    // Step 3: Update budget spent (if expense and has category)
    if (type === 'expense' && categoryId) {
      const currentMonth = txnDate.substring(0, 7);
      await supabase
        .from('budgets')
        .update({ spent: supabase.rpc('budget_add_spent', { amt: amount }) })
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .gte('start_date', `${currentMonth}-01`);
    }

    // Step 4: Update user stats
    await supabase.rpc('update_user_stats', { 
      p_user_id: userId, 
      p_amount: amount,
      p_has_emotion: !!emotion 
    });

    // Get updated account balance
    const { data: updatedAccount } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single();

    res.status(201).json({
      transaction,
      newBalance: updatedAccount?.balance
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/transactions/:id - Update transaction
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get original transaction first to calculate balance difference
    const { data: original } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!original) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    const { categoryId, amount, description, txnDate, emotion, tags } = req.body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (categoryId !== undefined) updates.category_id = categoryId;
    if (amount !== undefined) updates.amount = amount;
    if (description !== undefined) updates.description = description;
    if (txnDate !== undefined) updates.txn_date = txnDate;
    if (emotion !== undefined) updates.emotion = emotion;
    if (tags !== undefined) updates.tags = tags;

    // If amount changed, update account balance
    if (amount !== undefined && amount !== original.amount) {
      const difference = amount - original.amount;
      
      if (original.type === 'income') {
        await supabase.rpc('increment_balance', { account_id: original.account_id, delta: difference });
      } else if (original.type === 'expense') {
        await supabase.rpc('increment_balance', { account_id: original.account_id, delta: -difference });
      }
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        accounts:account_id (id, name, icon, color),
        categories (id, name, color, icon)
      `)
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to update transaction' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/transactions/:id - Delete transaction (and reverse balance)
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get transaction to reverse balance
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    // Reverse balance changes
    if (transaction.type === 'income') {
      await supabase.rpc('increment_balance', { account_id: transaction.account_id, delta: -transaction.amount });
    } else if (transaction.type === 'expense') {
      await supabase.rpc('increment_balance', { account_id: transaction.account_id, delta: transaction.amount });
    } else if (transaction.type === 'transfer' && transaction.to_account_id) {
      await supabase.rpc('increment_balance', { account_id: transaction.account_id, delta: transaction.amount });
      await supabase.rpc('increment_balance', { account_id: transaction.to_account_id, delta: -transaction.amount });
    }

    // Delete transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      res.status(500).json({ error: 'Failed to delete transaction' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
