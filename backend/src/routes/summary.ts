import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import { summaryQuerySchema, validateQuery } from '../middleware/validation';

const router = Router();

interface SummaryItem {
  name: string;
  color: string;
  total_expense: number;
  total_income: number;
}

// GET /api/summary - Get financial summary for a month
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate query
    const validation = validateQuery(summaryQuerySchema, req.query);
    if (!validation.success) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const { month } = validation.data;

    // Parse month to get date range
    const startDate = `${month}-01`;
    const [year, monthNum] = month.split('-').map(Number);
    const lastDay = new Date(year, monthNum, 0).getDate();
    const endDate = `${month}-${lastDay}`;

    // Get transactions with categories for the month
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .gte('txn_date', startDate)
      .lte('txn_date', endDate);

    if (error) {
      console.error('Database error:', error.message);
      res.status(500).json({ error: 'Failed to fetch summary' });
      return;
    }

    // Aggregate by category
    const categoryMap = new Map<string, SummaryItem>();
    let totalIncome = 0;
    let totalExpense = 0;

    transactions?.forEach((txn) => {
      const amount = Number(txn.amount);
      const categories = txn.categories as unknown as { id: number; name: string; color: string } | null;
      const categoryName = categories?.name || 'Uncategorized';
      const categoryColor = categories?.color || '#6b7280';

      if (amount > 0) {
        totalIncome += amount;
      } else {
        totalExpense += Math.abs(amount);
      }

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          name: categoryName,
          color: categoryColor,
          total_expense: 0,
          total_income: 0,
        });
      }

      const cat = categoryMap.get(categoryName)!;
      if (amount > 0) {
        cat.total_income += amount;
      } else {
        cat.total_expense += Math.abs(amount);
      }
    });

    const byCategory = Array.from(categoryMap.values())
      .sort((a, b) => b.total_expense - a.total_expense);

    res.json({
      month,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
