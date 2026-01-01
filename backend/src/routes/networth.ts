import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';

const router = Router();

// GET /api/networth - Get net worth history
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { months = '12' } = req.query;
    const numMonths = Math.min(parseInt(months as string) || 12, 60);

    const { data, error } = await supabase
      .from('net_worth_history')
      .select('*')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(numMonths);

    if (error) {
      res.status(500).json({ error: 'Failed to fetch net worth history' });
      return;
    }

    // Reverse for chronological order
    const history = data?.reverse() || [];

    // Calculate trends
    let trend = 0;
    let trendPercentage = 0;
    
    if (history.length >= 2) {
      const latest = history[history.length - 1].net_worth;
      const previous = history[history.length - 2].net_worth;
      trend = Number(latest) - Number(previous);
      trendPercentage = previous !== 0 ? Math.round((trend / Math.abs(Number(previous))) * 100) : 0;
    }

    res.json({
      history,
      current: history.length > 0 ? history[history.length - 1] : null,
      trend,
      trendPercentage,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching net worth history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/networth/snapshot - Create monthly snapshot
router.post('/snapshot', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get current month's first day
    const now = new Date();
    const snapshotDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    // Check if snapshot already exists
    const { data: existing } = await supabase
      .from('net_worth_history')
      .select('id')
      .eq('user_id', userId)
      .eq('snapshot_date', snapshotDate)
      .single();

    // Get all accounts
    const { data: accounts } = await supabase
      .from('accounts')
      .select('balance, is_asset, type')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Calculate totals
    let totalAssets = 0;
    let totalLiabilities = 0;
    let cashAndBank = 0;
    let investmentsValue = 0;
    let creditCards = 0;
    let loansValue = 0;

    accounts?.forEach(acc => {
      const balance = Number(acc.balance);
      if (acc.is_asset) {
        totalAssets += balance;
        if (['cash', 'bank', 'e-wallet'].includes(acc.type)) {
          cashAndBank += balance;
        } else if (acc.type === 'investment') {
          investmentsValue += balance;
        }
      } else {
        totalLiabilities += Math.abs(balance);
        if (acc.type === 'credit_card') {
          creditCards += Math.abs(balance);
        } else if (acc.type === 'loan') {
          loansValue += Math.abs(balance);
        }
      }
    });

    // Get debts (receivables/payables)
    const { data: debts } = await supabase
      .from('debts')
      .select('amount')
      .eq('user_id', userId)
      .eq('is_settled', false);

    let receivables = 0;
    let payables = 0;
    debts?.forEach(d => {
      if (d.amount > 0) receivables += Number(d.amount);
      else payables += Math.abs(Number(d.amount));
    });

    totalAssets += receivables;
    totalLiabilities += payables;

    const netWorth = totalAssets - totalLiabilities;

    // Get month's income/expense
    const monthStart = snapshotDate;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('txn_date', monthStart)
      .lte('txn_date', monthEnd);

    const totalIncome = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0;
    const totalExpense = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    const snapshotData = {
      user_id: userId,
      snapshot_date: snapshotDate,
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      net_worth: netWorth,
      cash_and_bank: cashAndBank,
      investments: investmentsValue,
      receivables,
      credit_cards: creditCards,
      loans: loansValue,
      payables,
      total_income: totalIncome,
      total_expense: totalExpense,
      savings_rate: savingsRate,
    };

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('net_worth_history')
        .update(snapshotData)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('net_worth_history')
        .insert(snapshotData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    res.status(existing ? 200 : 201).json({
      snapshot: result,
      isUpdate: !!existing
    });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/networth/current - Get current net worth (live calculation)
router.get('/current', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get all accounts
    const { data: accounts } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Get debts
    const { data: debts } = await supabase
      .from('debts')
      .select('amount')
      .eq('user_id', userId)
      .eq('is_settled', false);

    // Calculate
    const assets = accounts?.filter(a => a.is_asset) || [];
    const liabilities = accounts?.filter(a => !a.is_asset) || [];
    
    const totalAssets = assets.reduce((s, a) => s + Number(a.balance), 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + Math.abs(Number(a.balance)), 0);
    
    const receivables = debts?.filter(d => d.amount > 0).reduce((s, d) => s + Number(d.amount), 0) || 0;
    const payables = debts?.filter(d => d.amount < 0).reduce((s, d) => s + Math.abs(Number(d.amount)), 0) || 0;

    const netWorth = totalAssets + receivables - totalLiabilities - payables;

    res.json({
      netWorth,
      totalAssets: totalAssets + receivables,
      totalLiabilities: totalLiabilities + payables,
      breakdown: {
        accountAssets: totalAssets,
        receivables,
        accountLiabilities: totalLiabilities,
        payables
      },
      accounts: accounts?.map(a => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        type: a.type,
        balance: a.balance,
        isAsset: a.is_asset
      }))
    });
  } catch (error) {
    console.error('Error calculating current net worth:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
