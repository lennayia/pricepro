-- PricePro Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Note: Supabase Auth handles user creation automatically.
-- This table extends the auth.users with additional profile data if needed.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TIME ENTRIES TABLE (Tracker)
-- ============================================
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Activity categories (hours)
  client_communication DECIMAL(4,2) DEFAULT 0 CHECK (client_communication >= 0),
  content_creation DECIMAL(4,2) DEFAULT 0 CHECK (content_creation >= 0),
  social_media DECIMAL(4,2) DEFAULT 0 CHECK (social_media >= 0),
  administration DECIMAL(4,2) DEFAULT 0 CHECK (administration >= 0),
  messages DECIMAL(4,2) DEFAULT 0 CHECK (messages >= 0),
  education DECIMAL(4,2) DEFAULT 0 CHECK (education >= 0),
  billable_work DECIMAL(4,2) DEFAULT 0 CHECK (billable_work >= 0),
  other DECIMAL(4,2) DEFAULT 0 CHECK (other >= 0),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One entry per user per date
  UNIQUE(user_id, date)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON public.time_entries(user_id, date);

-- ============================================
-- CALCULATOR DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.calculator_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Layer 1: Living costs (monthly in CZK)
  housing_costs DECIMAL(10,2) DEFAULT 0 CHECK (housing_costs >= 0),
  living_costs DECIMAL(10,2) DEFAULT 0 CHECK (living_costs >= 0),
  business_costs DECIMAL(10,2) DEFAULT 0 CHECK (business_costs >= 0),
  savings DECIMAL(10,2) DEFAULT 0 CHECK (savings >= 0),

  -- Layer 2: Time data (weekly hours)
  weekly_hours DECIMAL(4,2) DEFAULT 0 CHECK (weekly_hours >= 0),
  billable_hours DECIMAL(4,2) DEFAULT 0 CHECK (billable_hours >= 0),

  -- Layer 3: Market value factors
  years_experience TEXT DEFAULT '0-2' CHECK (years_experience IN ('0-2', '3-5', '6-10', '10+')),
  specialization TEXT DEFAULT 'generalist' CHECK (specialization IN ('generalist', 'specialist')),
  portfolio_strength TEXT DEFAULT 'none' CHECK (portfolio_strength IN ('none', 'some', 'strong')),
  demand_level TEXT DEFAULT 'low' CHECK (demand_level IN ('low', 'medium', 'high', 'waiting')),

  -- Calculated results (stored for history)
  minimum_monthly DECIMAL(10,2),
  monthly_billable_hours DECIMAL(6,2),
  minimum_hourly DECIMAL(10,2),
  recommended_hourly DECIMAL(10,2),
  premium_hourly DECIMAL(10,2),
  total_coefficient DECIMAL(4,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_calculator_data_user ON public.calculator_data(user_id, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculator_data ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only view/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Time entries: Users can only access their own entries
CREATE POLICY "Users can view own time_entries"
  ON public.time_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own time_entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time_entries"
  ON public.time_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own time_entries"
  ON public.time_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Calculator data: Users can only access their own data
CREATE POLICY "Users can view own calculator_data"
  ON public.calculator_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculator_data"
  ON public.calculator_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculator_data"
  ON public.calculator_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculator_data"
  ON public.calculator_data FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_entries_updated_at ON public.time_entries;
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_calculator_data_updated_at ON public.calculator_data;
CREATE TRIGGER update_calculator_data_updated_at
  BEFORE UPDATE ON public.calculator_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
