-- =====================================================
-- SpendWise v2.0 - Helper Functions
-- Run this AFTER the main schema.sql
-- =====================================================

-- Function to increment account balance (for transaction processing)
CREATE OR REPLACE FUNCTION increment_balance(account_id UUID, delta NUMERIC)
RETURNS void AS $$
BEGIN
  UPDATE accounts
  SET balance = balance + delta,
      updated_at = NOW()
  WHERE id = account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user stats after transaction
CREATE OR REPLACE FUNCTION update_user_stats(
  p_user_id TEXT,
  p_amount NUMERIC,
  p_has_emotion BOOLEAN DEFAULT false
)
RETURNS void AS $$
DECLARE
  v_xp_bonus INT := 5;
  v_today DATE := CURRENT_DATE;
  v_stats RECORD;
BEGIN
  -- Get current stats
  SELECT * INTO v_stats FROM user_stats WHERE user_id = p_user_id;
  
  -- Calculate XP bonus
  IF p_has_emotion THEN
    v_xp_bonus := 10;
  END IF;
  
  IF v_stats IS NULL THEN
    -- Create new stats
    INSERT INTO user_stats (user_id, total_transactions, total_logged_amount, xp, last_active)
    VALUES (p_user_id, 1, p_amount, v_xp_bonus, v_today);
  ELSE
    -- Calculate streak
    DECLARE
      v_new_streak INT := 1;
      v_yesterday DATE := v_today - 1;
    BEGIN
      IF v_stats.last_active = v_yesterday THEN
        v_new_streak := v_stats.streak + 1;
      ELSIF v_stats.last_active = v_today THEN
        v_new_streak := v_stats.streak;
      END IF;
      
      -- Update stats
      UPDATE user_stats
      SET 
        total_transactions = total_transactions + 1,
        total_logged_amount = total_logged_amount + p_amount,
        xp = xp + v_xp_bonus,
        streak = v_new_streak,
        longest_streak = GREATEST(longest_streak, v_new_streak),
        last_active = v_today,
        level = CASE
          WHEN xp + v_xp_bonus >= 4500 THEN 10
          WHEN xp + v_xp_bonus >= 3600 THEN 9
          WHEN xp + v_xp_bonus >= 2800 THEN 8
          WHEN xp + v_xp_bonus >= 2100 THEN 7
          WHEN xp + v_xp_bonus >= 1500 THEN 6
          WHEN xp + v_xp_bonus >= 1000 THEN 5
          WHEN xp + v_xp_bonus >= 600 THEN 4
          WHEN xp + v_xp_bonus >= 300 THEN 3
          WHEN xp + v_xp_bonus >= 100 THEN 2
          ELSE 1
        END,
        updated_at = NOW()
      WHERE user_id = p_user_id;
    END;
  END IF;
  
  -- Check for first transaction achievement
  IF v_stats IS NULL OR v_stats.total_transactions = 0 THEN
    INSERT INTO achievements (user_id, badge_id)
    VALUES (p_user_id, 'first_steps')
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  
  -- Check for century club achievement (100 transactions)
  IF v_stats IS NOT NULL AND v_stats.total_transactions + 1 >= 100 THEN
    INSERT INTO achievements (user_id, badge_id)
    VALUES (p_user_id, 'century_club')
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add to budget spent
CREATE OR REPLACE FUNCTION budget_add_spent(amt NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN COALESCE(spent, 0) + amt;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_balance TO service_role;
GRANT EXECUTE ON FUNCTION update_user_stats TO service_role;
GRANT EXECUTE ON FUNCTION budget_add_spent TO service_role;
GRANT EXECUTE ON FUNCTION create_default_categories TO service_role;
