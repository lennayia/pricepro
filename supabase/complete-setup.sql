-- ============================================
-- COMPLETE PRICEPRO DATABASE SETUP
-- ============================================
-- Run this complete script to set up all tables and permissions
-- Safe to run multiple times (uses IF NOT EXISTS and DROP POLICY IF EXISTS)

-- ============================================
-- 1. SCHEMA SETUP
-- ============================================
CREATE SCHEMA IF NOT EXISTS pricepro;
GRANT USAGE ON SCHEMA pricepro TO authenticated;
GRANT USAGE ON SCHEMA pricepro TO anon;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pricepro.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  marketing_consent BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE pricepro.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select" ON pricepro.users;
CREATE POLICY "authenticated_select" ON pricepro.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "authenticated_insert" ON pricepro.users;
CREATE POLICY "authenticated_insert" ON pricepro.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "authenticated_update" ON pricepro.users;
CREATE POLICY "authenticated_update" ON pricepro.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "authenticated_delete" ON pricepro.users;
CREATE POLICY "authenticated_delete" ON pricepro.users
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- 3. TIME ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pricepro.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Work categories
  client_communication DECIMAL(4,2) DEFAULT 0,
  content_creation DECIMAL(4,2) DEFAULT 0,
  social_media DECIMAL(4,2) DEFAULT 0,
  administration DECIMAL(4,2) DEFAULT 0,
  messages DECIMAL(4,2) DEFAULT 0,
  education DECIMAL(4,2) DEFAULT 0,
  billable_work DECIMAL(4,2) DEFAULT 0,
  other DECIMAL(4,2) DEFAULT 0,

  -- Personal life categories
  sleep DECIMAL(4,2) DEFAULT 0,
  family_time DECIMAL(4,2) DEFAULT 0,
  personal_time DECIMAL(4,2) DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON pricepro.time_entries(user_id, date);

ALTER TABLE pricepro.time_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own time_entries" ON pricepro.time_entries;
CREATE POLICY "Users can view own time_entries"
  ON pricepro.time_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own time_entries" ON pricepro.time_entries;
CREATE POLICY "Users can insert own time_entries"
  ON pricepro.time_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own time_entries" ON pricepro.time_entries;
CREATE POLICY "Users can update own time_entries"
  ON pricepro.time_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own time_entries" ON pricepro.time_entries;
CREATE POLICY "Users can delete own time_entries"
  ON pricepro.time_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 4. CALCULATOR RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pricepro.calculator_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  minimum_monthly DECIMAL(10,2) NOT NULL,
  monthly_billable_hours DECIMAL(6,2) NOT NULL,
  minimum_hourly DECIMAL(10,2) NOT NULL,
  recommended_hourly DECIMAL(10,2) NOT NULL,
  premium_hourly DECIMAL(10,2) NOT NULL,
  coefficients DECIMAL(4,2) NOT NULL,
  inputs JSONB NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calculator_results_user_id
  ON pricepro.calculator_results(user_id);

CREATE INDEX IF NOT EXISTS idx_calculator_results_created_at
  ON pricepro.calculator_results(created_at DESC);

ALTER TABLE pricepro.calculator_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own calculator results" ON pricepro.calculator_results;
CREATE POLICY "Users can view own calculator results"
  ON pricepro.calculator_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own calculator results" ON pricepro.calculator_results;
CREATE POLICY "Users can insert own calculator results"
  ON pricepro.calculator_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own calculator results" ON pricepro.calculator_results;
CREATE POLICY "Users can update own calculator results"
  ON pricepro.calculator_results FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own calculator results" ON pricepro.calculator_results;
CREATE POLICY "Users can delete own calculator results"
  ON pricepro.calculator_results FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 5. TRIGGERS & FUNCTIONS
-- ============================================

-- Function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION pricepro.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for users table
DROP TRIGGER IF EXISTS update_pricepro_users_updated_at ON pricepro.users;
CREATE TRIGGER update_pricepro_users_updated_at
  BEFORE UPDATE ON pricepro.users
  FOR EACH ROW EXECUTE FUNCTION pricepro.update_updated_at_column();

-- Triggers for time_entries table
DROP TRIGGER IF EXISTS update_time_entries_updated_at ON pricepro.time_entries;
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON pricepro.time_entries
  FOR EACH ROW EXECUTE FUNCTION pricepro.update_updated_at_column();

-- Triggers for calculator_results table
DROP TRIGGER IF EXISTS calculator_results_updated_at ON pricepro.calculator_results;
CREATE TRIGGER calculator_results_updated_at
  BEFORE UPDATE ON pricepro.calculator_results
  FOR EACH ROW EXECUTE FUNCTION pricepro.update_updated_at_column();

-- ============================================
-- 6. AUTH TRIGGER (Auto-create user profile)
-- ============================================
CREATE OR REPLACE FUNCTION pricepro.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pricepro.users (id, email, first_name, last_name, full_name, terms_accepted, marketing_consent)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE((NEW.raw_user_meta_data->>'terms_accepted')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION pricepro.handle_new_user();

-- ============================================
-- 7. GRANT ALL PERMISSIONS
-- ============================================
GRANT ALL ON ALL TABLES IN SCHEMA pricepro TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA pricepro TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA pricepro TO authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA pricepro TO anon;

-- Default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA pricepro
  GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA pricepro
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA pricepro
  GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA pricepro
  GRANT SELECT ON SEQUENCES TO anon;
