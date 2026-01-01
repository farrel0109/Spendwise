-- =====================================================
-- SpendWise v2.0 - Financial Life Management System
-- Complete Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User Profiles (synced with Clerk)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  currency VARCHAR(3) DEFAULT 'IDR',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts/Wallets (Bank, Cash, E-Wallet, Investment)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- cash, bank, e-wallet, investment, credit_card, loan
  icon VARCHAR(10) DEFAULT '💳',
  color CHAR(7) DEFAULT '#3b82f6',
  balance NUMERIC(15,2) DEFAULT 0,
  initial_balance NUMERIC(15,2) DEFAULT 0,
  is_asset BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  institution VARCHAR(100),
  account_number VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories (enhanced with icons and subcategories)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name VARCHAR(60) NOT NULL,
  color CHAR(7) DEFAULT '#3b82f6',
  icon VARCHAR(10) DEFAULT '📁',
  type VARCHAR(10) DEFAULT 'expense',
  parent_id INT REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (multi-account with emotions)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL,
  type VARCHAR(10) NOT NULL,
  description TEXT,
  txn_date DATE NOT NULL,
  emotion VARCHAR(10),
  receipt_url TEXT,
  tags TEXT[],
  recurring_id UUID,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FINANCIAL PLANNING TABLES
-- =====================================================

-- Budgets (per category per period)
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL,
  spent NUMERIC(15,2) DEFAULT 0,
  period VARCHAR(20) DEFAULT 'monthly',
  start_date DATE NOT NULL,
  alert_threshold INT DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Savings Goals
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  linked_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  target_amount NUMERIC(15,2) NOT NULL,
  current_amount NUMERIC(15,2) DEFAULT 0,
  target_date DATE,
  icon VARCHAR(10) DEFAULT '🎯',
  color CHAR(7) DEFAULT '#22c55e',
  priority INT DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal Contributions
CREATE TABLE IF NOT EXISTS goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  note TEXT,
  contributed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring Transactions
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL,
  type VARCHAR(10) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL,
  day_of_month INT,
  day_of_week INT,
  next_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  last_processed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DEBT & LIABILITY MANAGEMENT
-- =====================================================

-- Personal Debts
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  person_name VARCHAR(100) NOT NULL,
  person_contact TEXT,
  amount NUMERIC(15,2) NOT NULL,
  original_amount NUMERIC(15,2) NOT NULL,
  description TEXT,
  due_date DATE,
  reminder_enabled BOOLEAN DEFAULT true,
  is_settled BOOLEAN DEFAULT false,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Debt Payments
CREATE TABLE IF NOT EXISTS debt_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  note TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institutional Loans
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  linked_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL,
  principal_amount NUMERIC(15,2) NOT NULL,
  current_balance NUMERIC(15,2) NOT NULL,
  interest_rate NUMERIC(5,2),
  monthly_payment NUMERIC(15,2),
  start_date DATE,
  end_date DATE,
  next_payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVESTMENT & ASSETS
-- =====================================================

-- Investments
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  linked_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL,
  ticker_symbol VARCHAR(20),
  quantity NUMERIC(15,6),
  purchase_price NUMERIC(15,2),
  current_price NUMERIC(15,2),
  total_value NUMERIC(15,2),
  purchase_date DATE,
  institution VARCHAR(100),
  notes TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NET WORTH & HISTORY
-- =====================================================

-- Monthly Net Worth Snapshots
CREATE TABLE IF NOT EXISTS net_worth_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  total_assets NUMERIC(15,2) NOT NULL,
  total_liabilities NUMERIC(15,2) NOT NULL,
  net_worth NUMERIC(15,2) NOT NULL,
  cash_and_bank NUMERIC(15,2) DEFAULT 0,
  investments NUMERIC(15,2) DEFAULT 0,
  receivables NUMERIC(15,2) DEFAULT 0,
  credit_cards NUMERIC(15,2) DEFAULT 0,
  loans NUMERIC(15,2) DEFAULT 0,
  payables NUMERIC(15,2) DEFAULT 0,
  total_income NUMERIC(15,2) DEFAULT 0,
  total_expense NUMERIC(15,2) DEFAULT 0,
  savings_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- =====================================================
-- GAMIFICATION
-- =====================================================

-- User Stats & Progress
CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active DATE,
  total_transactions INT DEFAULT 0,
  total_logged_amount NUMERIC(15,2) DEFAULT 0,
  financial_score INT DEFAULT 50,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  badge_id VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_txn_date ON transactions(txn_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_net_worth_user_id ON net_worth_history(user_id);
CREATE INDEX IF NOT EXISTS idx_net_worth_date ON net_worth_history(snapshot_date);

-- =====================================================
-- ENABLE RLS (Row Level Security)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- GRANT PERMISSIONS TO SERVICE ROLE
-- =====================================================

GRANT ALL ON profiles TO service_role;
GRANT ALL ON accounts TO service_role;
GRANT ALL ON categories TO service_role;
GRANT ALL ON transactions TO service_role;
GRANT ALL ON budgets TO service_role;
GRANT ALL ON savings_goals TO service_role;
GRANT ALL ON goal_contributions TO service_role;
GRANT ALL ON recurring_transactions TO service_role;
GRANT ALL ON debts TO service_role;
GRANT ALL ON debt_payments TO service_role;
GRANT ALL ON loans TO service_role;
GRANT ALL ON investments TO service_role;
GRANT ALL ON net_worth_history TO service_role;
GRANT ALL ON user_stats TO service_role;
GRANT ALL ON achievements TO service_role;
GRANT USAGE, SELECT ON SEQUENCE categories_id_seq TO service_role;

-- =====================================================
-- DEFAULT CATEGORIES FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION create_default_categories(p_user_id TEXT)
RETURNS void AS $$
BEGIN
  -- Expense categories
  INSERT INTO categories (user_id, name, color, icon, type) VALUES
    (p_user_id, 'Food & Dining', '#ef4444', '🍔', 'expense'),
    (p_user_id, 'Transportation', '#f97316', '🚗', 'expense'),
    (p_user_id, 'Shopping', '#eab308', '🛒', 'expense'),
    (p_user_id, 'Entertainment', '#22c55e', '🎬', 'expense'),
    (p_user_id, 'Bills & Utilities', '#3b82f6', '📱', 'expense'),
    (p_user_id, 'Health', '#ec4899', '💊', 'expense'),
    (p_user_id, 'Education', '#8b5cf6', '📚', 'expense'),
    (p_user_id, 'Personal Care', '#14b8a6', '💅', 'expense'),
    (p_user_id, 'Others', '#6b7280', '📦', 'expense');
  
  -- Income categories
  INSERT INTO categories (user_id, name, color, icon, type) VALUES
    (p_user_id, 'Salary', '#22c55e', '💰', 'income'),
    (p_user_id, 'Freelance', '#3b82f6', '💼', 'income'),
    (p_user_id, 'Investment Return', '#8b5cf6', '📈', 'income'),
    (p_user_id, 'Gift', '#ec4899', '🎁', 'income'),
    (p_user_id, 'Other Income', '#6b7280', '💵', 'income');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
