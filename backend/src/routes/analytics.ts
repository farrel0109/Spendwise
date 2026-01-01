import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';

const router = Router();

// GET /api/analytics/trends - Monthly comparison
router.get('/trends', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { months = '6' } = req.query;
    const numMonths = Math.min(parseInt(months as string) || 6, 24);

    // Get transactions for the last N months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - numMonths + 1);
    startDate.setDate(1);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type, txn_date')
      .eq('user_id', userId)
      .gte('txn_date', startDateStr)
      .order('txn_date', { ascending: true });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch trends' });
      return;
    }

    // Group by month
    const monthlyData = new Map<string, { income: number; expense: number; savings: number }>();

    transactions?.forEach(txn => {
      const month = txn.txn_date.substring(0, 7);
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { income: 0, expense: 0, savings: 0 });
      }
      const data = monthlyData.get(month)!;
      if (txn.type === 'income') {
        data.income += Number(txn.amount);
      } else if (txn.type === 'expense') {
        data.expense += Number(txn.amount);
      }
      data.savings = data.income - data.expense;
    });

    // Convert to array
    const trends = Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      ...data,
      savingsRate: data.income > 0 ? Math.round((data.savings / data.income) * 100) : 0
    }));

    res.json({
      trends,
      summary: {
        avgIncome: trends.length > 0 ? Math.round(trends.reduce((s, t) => s + t.income, 0) / trends.length) : 0,
        avgExpense: trends.length > 0 ? Math.round(trends.reduce((s, t) => s + t.expense, 0) / trends.length) : 0,
        avgSavingsRate: trends.length > 0 ? Math.round(trends.reduce((s, t) => s + t.savingsRate, 0) / trends.length) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/patterns - Spending patterns
router.get('/patterns', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { month } = req.query;
    
    // Calculate date range
    let startDate: string, endDate: string;
    if (month && typeof month === 'string') {
      startDate = `${month}-01`;
      const [year, monthNum] = month.split('-').map(Number);
      const lastDay = new Date(year, monthNum, 0).getDate();
      endDate = `${month}-${lastDay}`;
    } else {
      const now = new Date();
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        amount, type, txn_date, emotion,
        categories (id, name, color, icon)
      `)
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('txn_date', startDate)
      .lte('txn_date', endDate);

    if (error) {
      res.status(500).json({ error: 'Failed to fetch patterns' });
      return;
    }

    // By category
    const byCategory = new Map<string, { name: string; color: string; icon: string; total: number; count: number }>();
    
    // By day of week
    const byDayOfWeek = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // By emotion
    const byEmotion = new Map<string, { total: number; count: number }>();

    transactions?.forEach((txn: { amount: number; type: string; txn_date: string; emotion?: string; categories: unknown }) => {
      // Category
      const cat = txn.categories as { id: number; name: string; color: string; icon: string } | null;
      const catName = cat?.name || 'Uncategorized';
      if (!byCategory.has(catName)) {
        byCategory.set(catName, {
          name: catName,
          color: cat?.color || '#6b7280',
          icon: cat?.icon || '📦',
          total: 0,
          count: 0
        });
      }
      const catData = byCategory.get(catName)!;
      catData.total += Number(txn.amount);
      catData.count += 1;

      // Day of week
      const dow = new Date(txn.txn_date).getDay();
      byDayOfWeek[dow] += Number(txn.amount);

      // Emotion
      if (txn.emotion) {
        if (!byEmotion.has(txn.emotion)) {
          byEmotion.set(txn.emotion, { total: 0, count: 0 });
        }
        const emData = byEmotion.get(txn.emotion)!;
        emData.total += Number(txn.amount);
        emData.count += 1;
      }
    });

    // Sort categories by total
    const categoryBreakdown = Array.from(byCategory.values())
      .sort((a, b) => b.total - a.total);

    const totalExpense = categoryBreakdown.reduce((s, c) => s + c.total, 0);

    res.json({
      byCategory: categoryBreakdown.map(c => ({
        ...c,
        percentage: totalExpense > 0 ? Math.round((c.total / totalExpense) * 100) : 0
      })),
      byDayOfWeek: byDayOfWeek.map((amount, index) => ({
        day: dayNames[index],
        amount
      })),
      byEmotion: Array.from(byEmotion.entries()).map(([emotion, data]) => ({
        emotion,
        ...data,
        avgPerTransaction: data.count > 0 ? Math.round(data.total / data.count) : 0
      })),
      topSpendingDay: dayNames[byDayOfWeek.indexOf(Math.max(...byDayOfWeek))],
      totalExpense
    });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/health-score - Financial health score
router.get('/health-score', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get accounts for net worth
    const { data: accounts } = await supabase
      .from('accounts')
      .select('balance, is_asset')
      .eq('user_id', userId)
      .eq('is_active', true);

    const totalAssets = accounts?.filter(a => a.is_asset).reduce((s, a) => s + Number(a.balance), 0) || 0;
    const totalLiabilities = accounts?.filter(a => !a.is_asset).reduce((s, a) => s + Math.abs(Number(a.balance)), 0) || 0;
    const netWorth = totalAssets - totalLiabilities;

    // Get last 3 months data
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const startDate = threeMonthsAgo.toISOString().split('T')[0];

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('txn_date', startDate);

    const totalIncome = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0;
    const totalExpense = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

    // Calculate score components (0-100 each)
    let savingsScore = Math.min(100, Math.max(0, savingsRate * 5)); // 20% savings = 100
    let debtScore = Math.min(100, Math.max(0, 100 - debtToAssetRatio)); // Less debt = higher score
    let diversificationScore = 50; // TODO: Calculate based on account types

    // Get budget adherence
    const { data: budgets } = await supabase
      .from('budgets')
      .select('amount, spent')
      .eq('user_id', userId);

    let budgetScore = 50;
    if (budgets && budgets.length > 0) {
      const avgBudgetAdherence = budgets.reduce((s, b) => {
        const adherence = b.spent <= b.amount ? 100 : Math.max(0, 100 - ((b.spent - b.amount) / b.amount) * 100);
        return s + adherence;
      }, 0) / budgets.length;
      budgetScore = avgBudgetAdherence;
    }

    // Calculate final score (weighted average)
    const finalScore = Math.round(
      savingsScore * 0.3 +
      debtScore * 0.25 +
      budgetScore * 0.25 +
      diversificationScore * 0.2
    );

    // Determine grade
    let grade: string;
    if (finalScore >= 90) grade = 'A+';
    else if (finalScore >= 80) grade = 'A';
    else if (finalScore >= 70) grade = 'B';
    else if (finalScore >= 60) grade = 'C';
    else if (finalScore >= 50) grade = 'D';
    else grade = 'F';

    // Generate tips
    const tips: string[] = [];
    if (savingsRate < 10) tips.push('Try to save at least 10% of your income');
    if (debtToAssetRatio > 50) tips.push('Focus on paying down high-interest debt');
    if (budgetScore < 70) tips.push('Review your budget and reduce overspending categories');
    if (tips.length === 0) tips.push('Great job! Keep maintaining your financial habits');

    // Update user stats
    await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        financial_score: finalScore,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    res.json({
      score: finalScore,
      grade,
      breakdown: {
        savings: { score: Math.round(savingsScore), rate: Math.round(savingsRate) },
        debt: { score: Math.round(debtScore), ratio: Math.round(debtToAssetRatio) },
        budget: { score: Math.round(budgetScore) },
        diversification: { score: Math.round(diversificationScore) }
      },
      summary: {
        netWorth,
        totalAssets,
        totalLiabilities,
        monthlyIncome: Math.round(totalIncome / 3),
        monthlyExpense: Math.round(totalExpense / 3)
      },
      tips
    });
  } catch (error) {
    console.error('Error calculating health score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
