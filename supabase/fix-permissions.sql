-- ============================================
-- FIX ALL PERMISSIONS FOR PRICEPRO
-- ============================================
-- Run this to fix any permission issues
-- Safe to run multiple times (uses IF NOT EXISTS where possible)

-- Ensure schema exists and has correct permissions
GRANT USAGE ON SCHEMA pricepro TO authenticated;
GRANT USAGE ON SCHEMA pricepro TO anon;

-- Grant permissions on ALL existing tables
GRANT ALL ON ALL TABLES IN SCHEMA pricepro TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA pricepro TO anon;

-- Grant permissions on ALL existing sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA pricepro TO authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA pricepro TO anon;

-- Ensure future tables also get these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA pricepro
  GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA pricepro
  GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA pricepro
  GRANT ALL ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA pricepro
  GRANT SELECT ON SEQUENCES TO anon;

-- Specific table permissions (just to be sure)
GRANT ALL ON pricepro.users TO authenticated;
GRANT SELECT ON pricepro.users TO anon;

GRANT ALL ON pricepro.time_entries TO authenticated;
GRANT SELECT ON pricepro.time_entries TO anon;

GRANT ALL ON pricepro.calculator_results TO authenticated;
GRANT SELECT ON pricepro.calculator_results TO anon;
