-- ============================================
-- PRICEPRO APPLICATION TABLES
-- ============================================
-- Run this AFTER pricepro-schema.sql and pricepro-users-table.sql
-- Contains: time_entries, calculator_data

-- ============================================
-- TIME ENTRIES TABLE (Tracker)
-- ============================================
CREATE TABLE IF NOT EXISTS pricepro.time_entries (
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
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON pricepro.time_entries(user_id, date);

-- ============================================
-- CALCULATOR DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pricepro.calculator_data (
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
CREATE INDEX IF NOT EXISTS idx_calculator_data_user ON pricepro.calculator_data(user_id, created_at DESC);

-- ============================================
-- GRANT PERMISSIONS (CRITICAL!)
-- ============================================
GRANT ALL ON pricepro.time_entries TO authenticated;
GRANT SELECT ON pricepro.time_entries TO anon;

GRANT ALL ON pricepro.calculator_data TO authenticated;
GRANT SELECT ON pricepro.calculator_data TO anon;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Time entries: Users can only access their own entries
ALTER TABLE pricepro.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time_entries"
  ON pricepro.time_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own time_entries"
  ON pricepro.time_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time_entries"
  ON pricepro.time_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own time_entries"
  ON pricepro.time_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Calculator data: Users can only access their own data
ALTER TABLE pricepro.calculator_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calculator_data"
  ON pricepro.calculator_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculator_data"
  ON pricepro.calculator_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculator_data"
  ON pricepro.calculator_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculator_data"
  ON pricepro.calculator_data FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Triggers for updated_at on time_entries
DROP TRIGGER IF EXISTS update_time_entries_updated_at ON pricepro.time_entries;
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON pricepro.time_entries
  FOR EACH ROW EXECUTE FUNCTION pricepro.update_updated_at_column();

-- Triggers for updated_at on calculator_data
DROP TRIGGER IF EXISTS update_calculator_data_updated_at ON pricepro.calculator_data;
CREATE TRIGGER update_calculator_data_updated_at
  BEFORE UPDATE ON pricepro.calculator_data
  FOR EACH ROW EXECUTE FUNCTION pricepro.update_updated_at_column();
