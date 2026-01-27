-- ============================================
-- PRICEPRO USERS TABLE
-- ============================================
-- Run this AFTER pricepro-schema.sql
-- This table extends auth.users with PricePro-specific profile data

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

-- ============================================
-- GRANT PERMISSIONS (CRITICAL!)
-- ============================================
-- RLS policies alone are NOT enough - you MUST grant table permissions
GRANT ALL ON pricepro.users TO authenticated;
GRANT SELECT ON pricepro.users TO anon;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE pricepro.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "authenticated_select" ON pricepro.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "authenticated_insert" ON pricepro.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "authenticated_update" ON pricepro.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "authenticated_delete" ON pricepro.users
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION pricepro.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on pricepro.users
DROP TRIGGER IF EXISTS update_pricepro_users_updated_at ON pricepro.users;
CREATE TRIGGER update_pricepro_users_updated_at
  BEFORE UPDATE ON pricepro.users
  FOR EACH ROW EXECUTE FUNCTION pricepro.update_updated_at_column();
