-- ============================================
-- CLEANUP: Remove old unused tables
-- ============================================
-- This removes tables that were created but are not used in the app

-- Drop calculator_data table (replaced by calculator_results)
DROP TABLE IF EXISTS pricepro.calculator_data CASCADE;

-- Note: This is safe to run. If the table doesn't exist, it will be ignored.
-- CASCADE will also drop any dependent objects (triggers, policies, etc.)
