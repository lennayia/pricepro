-- Migration: Calculator Results Table
-- Stores pricing calculator results for users

-- Create calculator_results table
CREATE TABLE IF NOT EXISTS pricepro.calculator_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Calculated results
  minimum_monthly DECIMAL(10,2) NOT NULL,
  monthly_billable_hours DECIMAL(6,2) NOT NULL,
  minimum_hourly DECIMAL(10,2) NOT NULL,
  recommended_hourly DECIMAL(10,2) NOT NULL,
  premium_hourly DECIMAL(10,2) NOT NULL,
  coefficients DECIMAL(4,2) NOT NULL,

  -- User inputs (stored as JSONB for flexibility)
  inputs JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_calculator_results_user_id
ON pricepro.calculator_results(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_calculator_results_created_at
ON pricepro.calculator_results(created_at DESC);

-- Enable Row Level Security
ALTER TABLE pricepro.calculator_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own calculator results
CREATE POLICY "Users can view own calculator results"
ON pricepro.calculator_results
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own calculator results
CREATE POLICY "Users can insert own calculator results"
ON pricepro.calculator_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own calculator results
CREATE POLICY "Users can update own calculator results"
ON pricepro.calculator_results
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own calculator results
CREATE POLICY "Users can delete own calculator results"
ON pricepro.calculator_results
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION pricepro.update_calculator_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS calculator_results_updated_at ON pricepro.calculator_results;
CREATE TRIGGER calculator_results_updated_at
  BEFORE UPDATE ON pricepro.calculator_results
  FOR EACH ROW
  EXECUTE FUNCTION pricepro.update_calculator_results_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON pricepro.calculator_results TO authenticated;
GRANT USAGE ON SCHEMA pricepro TO authenticated;
