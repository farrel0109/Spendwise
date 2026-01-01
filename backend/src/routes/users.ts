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

// PATCH /api/users/profile - Update user profile
router.patch('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { currency, onboardingCompleted } = req.body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (currency) updates.currency = currency;
    if (onboardingCompleted !== undefined) updates.onboarding_completed = onboardingCompleted;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('clerk_id', userId)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to update profile' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
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

export default router;
