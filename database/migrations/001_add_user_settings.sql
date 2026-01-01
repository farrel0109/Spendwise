-- =====================================================
-- SpendWise - User Settings Migration
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add new columns to profiles table for user customization
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'dark';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accent_color CHAR(7) DEFAULT '#007aff';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'id';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_budget BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_goals BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_achievements BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_hide_amounts BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN profiles.display_name IS 'User display name for personalization';
COMMENT ON COLUMN profiles.bio IS 'Short user bio/description (max 160 chars)';
COMMENT ON COLUMN profiles.theme IS 'UI theme: light, dark, or system';
COMMENT ON COLUMN profiles.accent_color IS 'Accent color hex code';
COMMENT ON COLUMN profiles.language IS 'Preferred language: id or en';
COMMENT ON COLUMN profiles.date_format IS 'Preferred date format';
COMMENT ON COLUMN profiles.notification_budget IS 'Enable budget alert notifications';
COMMENT ON COLUMN profiles.notification_goals IS 'Enable goal reminder notifications';
COMMENT ON COLUMN profiles.notification_achievements IS 'Enable achievement notifications';
COMMENT ON COLUMN profiles.privacy_hide_amounts IS 'Hide amounts by default';
