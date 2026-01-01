import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';

const router = Router();

// Badge definitions
const BADGES = {
  first_steps: { name: 'First Steps', icon: '🌱', description: 'Track your first transaction' },
  on_fire: { name: 'On Fire', icon: '🔥', description: '7-day tracking streak' },
  diamond_hands: { name: 'Diamond Hands', icon: '💎', description: '30-day tracking streak' },
  goal_getter: { name: 'Goal Getter', icon: '🎯', description: 'Complete a savings goal' },
  analyst: { name: 'Analyst', icon: '📊', description: 'View analytics 10 times' },
  budget_master: { name: 'Budget Master', icon: '💰', description: 'Stay under budget for 3 months' },
  debt_free: { name: 'Debt Free', icon: '🏆', description: 'Settle all debts' },
  receipt_collector: { name: 'Receipt Collector', icon: '📸', description: 'Upload 50 receipts' },
  voice_commander: { name: 'Voice Commander', icon: '🗣️', description: 'Use voice input 20 times' },
  mindful_spender: { name: 'Mindful Spender', icon: '🧘', description: 'Tag emotions for 7 days' },
  century_club: { name: 'Century Club', icon: '💯', description: 'Track 100 transactions' },
  big_saver: { name: 'Big Saver', icon: '🤑', description: 'Save 1 million' },
  consistent: { name: 'Consistent', icon: '📅', description: 'Track every day for a month' },
};

// XP requirements per level
const LEVEL_XP = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];
const LEVEL_TITLES = ['Beginner', 'Tracker', 'Saver', 'Budgeter', 'Analyst', 'Strategist', 'Expert', 'Master', 'Guru', 'Legend', 'Mythic'];

// GET /api/gamification/stats - Get user stats
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get or create stats
    let { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!stats) {
      const { data: newStats } = await supabase
        .from('user_stats')
        .insert({ user_id: userId })
        .select()
        .single();
      stats = newStats;
    }

    if (!stats) {
      res.status(500).json({ error: 'Failed to get stats' });
      return;
    }

    // Calculate level info
    const level = stats.level;
    const currentXP = stats.xp;
    const xpForCurrentLevel = LEVEL_XP[level - 1] || 0;
    const xpForNextLevel = LEVEL_XP[level] || LEVEL_XP[LEVEL_XP.length - 1];
    const xpProgress = currentXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = Math.round((xpProgress / xpNeeded) * 100);

    res.json({
      level: stats.level,
      title: LEVEL_TITLES[stats.level - 1] || 'Legend',
      xp: currentXP,
      xpProgress,
      xpNeeded,
      progressPercent,
      streak: stats.streak,
      longestStreak: stats.longest_streak,
      totalTransactions: stats.total_transactions,
      financialScore: stats.financial_score,
      lastActive: stats.last_active
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/gamification/achievements - Get earned achievements
router.get('/achievements', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: earned, error } = await supabase
      .from('achievements')
      .select('badge_id, earned_at')
      .eq('user_id', userId);

    if (error) {
      res.status(500).json({ error: 'Failed to fetch achievements' });
      return;
    }

    const earnedIds = new Set(earned?.map(a => a.badge_id));

    const achievements = Object.entries(BADGES).map(([id, badge]) => ({
      id,
      ...badge,
      earned: earnedIds.has(id),
      earnedAt: earned?.find(a => a.badge_id === id)?.earned_at
    }));

    res.json({
      achievements,
      earnedCount: earnedIds.size,
      totalCount: Object.keys(BADGES).length,
      completionPercent: Math.round((earnedIds.size / Object.keys(BADGES).length) * 100)
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gamification/check-in - Daily check-in for streak
router.post('/check-in', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Get current stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!stats) {
      res.status(404).json({ error: 'Stats not found' });
      return;
    }

    // Check if already checked in today
    if (stats.last_active === today) {
      res.json({ 
        message: 'Already checked in today',
        streak: stats.streak,
        xpAwarded: 0
      });
      return;
    }

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = 1;
    if (stats.last_active === yesterdayStr) {
      newStreak = stats.streak + 1;
    }

    const longestStreak = Math.max(stats.longest_streak, newStreak);
    
    // Award XP for check-in
    const xpAwarded = 20;
    const newXP = stats.xp + xpAwarded;
    
    // Calculate new level
    let newLevel = stats.level;
    while (newLevel < LEVEL_XP.length && newXP >= LEVEL_XP[newLevel]) {
      newLevel++;
    }

    // Update stats
    await supabase
      .from('user_stats')
      .update({
        streak: newStreak,
        longest_streak: longestStreak,
        last_active: today,
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    // Check for streak achievements
    const newAchievements: string[] = [];
    
    if (newStreak >= 7) {
      const { data: existing } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', 'on_fire')
        .single();
      
      if (!existing) {
        await supabase.from('achievements').insert({ user_id: userId, badge_id: 'on_fire' });
        newAchievements.push('on_fire');
      }
    }
    
    if (newStreak >= 30) {
      const { data: existing } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', 'diamond_hands')
        .single();
      
      if (!existing) {
        await supabase.from('achievements').insert({ user_id: userId, badge_id: 'diamond_hands' });
        newAchievements.push('diamond_hands');
      }
    }

    res.json({
      message: 'Check-in successful!',
      streak: newStreak,
      xpAwarded,
      newXP,
      levelUp: newLevel > stats.level,
      newLevel,
      newAchievements: newAchievements.map(id => ({ id, ...BADGES[id as keyof typeof BADGES] }))
    });
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gamification/award-xp - Award XP for action
router.post('/award-xp', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { action, amount } = req.body;

    // XP values for different actions
    const XP_VALUES: Record<string, number> = {
      add_transaction: 5,
      add_transaction_with_emotion: 10,
      upload_receipt: 15,
      use_voice_input: 10,
      complete_goal: 100,
      stay_under_budget: 50,
    };

    const xpToAward = amount || XP_VALUES[action] || 0;

    if (xpToAward === 0) {
      res.json({ xpAwarded: 0 });
      return;
    }

    // Get current stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('xp, level')
      .eq('user_id', userId)
      .single();

    if (!stats) {
      res.status(404).json({ error: 'Stats not found' });
      return;
    }

    const newXP = stats.xp + xpToAward;
    
    // Calculate new level
    let newLevel = stats.level;
    while (newLevel < LEVEL_XP.length && newXP >= LEVEL_XP[newLevel]) {
      newLevel++;
    }

    // Update stats
    await supabase
      .from('user_stats')
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    res.json({
      xpAwarded: xpToAward,
      newXP,
      levelUp: newLevel > stats.level,
      newLevel
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
