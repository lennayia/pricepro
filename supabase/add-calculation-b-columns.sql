-- Add Calculation B columns to calculator_results table
-- This adds fields for the dignity wage approach calculation

ALTER TABLE pricepro.calculator_results
ADD COLUMN IF NOT EXISTS dignity_monthly_earnings NUMERIC,
ADD COLUMN IF NOT EXISTS dignity_minimum_hourly NUMERIC,
ADD COLUMN IF NOT EXISTS dignity_recommended_hourly NUMERIC,
ADD COLUMN IF NOT EXISTS dignity_premium_hourly NUMERIC,
ADD COLUMN IF NOT EXISTS base_hourly_wage NUMERIC;

-- Add comments to document the new columns
COMMENT ON COLUMN pricepro.calculator_results.dignity_monthly_earnings IS 'Calculation B: What you should earn monthly based on dignity wage (total hours × base wage × OSVČ coefficient)';
COMMENT ON COLUMN pricepro.calculator_results.dignity_minimum_hourly IS 'Calculation B: Minimum hourly rate to achieve dignity wage';
COMMENT ON COLUMN pricepro.calculator_results.dignity_recommended_hourly IS 'Calculation B: Recommended hourly rate with market coefficients';
COMMENT ON COLUMN pricepro.calculator_results.dignity_premium_hourly IS 'Calculation B: Premium hourly rate (1.3× recommended)';
COMMENT ON COLUMN pricepro.calculator_results.base_hourly_wage IS 'Base hourly wage used for Calculation B (from minimal/average/custom selection)';
