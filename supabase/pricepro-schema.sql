-- ============================================
-- PRICEPRO SCHEMA SETUP
-- ============================================
-- This creates a separate schema for PricePro in the shared Supabase project
-- Run this FIRST before other SQL files

-- Create the pricepro schema
CREATE SCHEMA IF NOT EXISTS pricepro;

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA pricepro TO authenticated;
GRANT USAGE ON SCHEMA pricepro TO anon;

-- Grant permissions for all current and future tables
GRANT ALL ON ALL TABLES IN SCHEMA pricepro TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA pricepro TO anon;

-- Ensure future tables also get these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA pricepro
  GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA pricepro
  GRANT SELECT ON TABLES TO anon;

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
