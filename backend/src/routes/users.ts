import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';

const router = Router();

// POST /api/users/sync - Sync user profile from Clerk
router.post('/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { email, fullName, avatarUrl } = req.body;

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
        return;
      }

      res.json({ 
        isNewUser: false, 
        profile: data,
        needsOnboarding: !data.onboarding_completed
      });
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          clerk_id: userId,
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ error: 'Failed to create profile' });
        return;
      }

      // Create default categories for new user
      await supabase.rpc('create_default_categories', { p_user_id: userId });

      // Initialize user stats
      await supabase
        .from('user_stats')
        .insert({ user_id: userId });

      res.status(201).json({ 
        isNewUser: true, 
        profile: data,
        needsOnboarding: true
      });
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/profile - Get user profile
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/users/profile - Update user profile (all fields)
router.patch('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { 
      displayName,
      bio,
      avatarUrl,
      currency, 
      theme,
      accentColor,
      language,
      dateFormat,
      notificationBudget,
      notificationGoals,
      notificationAchievements,
      privacyHideAmounts,
      onboardingCompleted 
    } = req.body;

    // Build updates object dynamically
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    
    // Profile fields
    if (displayName !== undefined) updates.display_name = displayName;
    if (bio !== undefined) {
      // Limit bio to 160 characters
      updates.bio = typeof bio === 'string' ? bio.substring(0, 160) : bio;
    }
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    if (currency !== undefined) updates.currency = currency;
    
    // Appearance fields
    if (theme !== undefined) {
      if (['light', 'dark', 'system'].includes(theme)) {
        updates.theme = theme;
      }
    }
    if (accentColor !== undefined) {
      // Validate hex color
      if (/^#[0-9A-Fa-f]{6}$/.test(accentColor)) {
        updates.accent_color = accentColor;
      }
    }
    
    // Preference fields
    if (language !== undefined) {
      if (['id', 'en'].includes(language)) {
        updates.language = language;
      }
    }
    if (dateFormat !== undefined) updates.date_format = dateFormat;
    
    // Notification fields
    if (notificationBudget !== undefined) updates.notification_budget = notificationBudget;
    if (notificationGoals !== undefined) updates.notification_goals = notificationGoals;
    if (notificationAchievements !== undefined) updates.notification_achievements = notificationAchievements;
    
    // Privacy fields
    if (privacyHideAmounts !== undefined) updates.privacy_hide_amounts = privacyHideAmounts;
    
    // Onboarding
    if (onboardingCompleted !== undefined) updates.onboarding_completed = onboardingCompleted;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('clerk_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/settings - Get user settings/preferences
router.get('/settings', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        display_name,
        bio,
        avatar_url,
        currency,
        theme,
        accent_color,
        language,
        date_format,
        notification_budget,
        notification_goals,
        notification_achievements,
        privacy_hide_amounts
      `)
      .eq('clerk_id', userId)
      .single();

    if (error) {
      res.status(404).json({ error: 'Settings not found' });
      return;
    }

    // Transform to camelCase for frontend
    res.json({
      displayName: data.display_name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      currency: data.currency,
      theme: data.theme,
      accentColor: data.accent_color,
      language: data.language,
      dateFormat: data.date_format,
      notificationBudget: data.notification_budget,
      notificationGoals: data.notification_goals,
      notificationAchievements: data.notification_achievements,
      privacyHideAmounts: data.privacy_hide_amounts,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users/complete-onboarding - Complete onboarding
router.post('/complete-onboarding', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', userId)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to complete onboarding' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users/export - Export user data
router.post('/export', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch all user data
    const [profile, accounts, transactions, categories, budgets, goals, debts] = await Promise.all([
      supabase.from('profiles').select('*').eq('clerk_id', userId).single(),
      supabase.from('accounts').select('*').eq('user_id', userId),
      supabase.from('transactions').select('*').eq('user_id', userId),
      supabase.from('categories').select('*').eq('user_id', userId),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('savings_goals').select('*').eq('user_id', userId),
      supabase.from('debts').select('*').eq('user_id', userId),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: profile.data,
      accounts: accounts.data,
      transactions: transactions.data,
      categories: categories.data,
      budgets: budgets.data,
      savingsGoals: goals.data,
      debts: debts.data,
    };

    res.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
