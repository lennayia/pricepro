-- Add updated_at column to time_entries table
ALTER TABLE pricepro.time_entries
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create a trigger to automatically update updated_at on row update
CREATE OR REPLACE FUNCTION pricepro.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_time_entries_updated_at ON pricepro.time_entries;

CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON pricepro.time_entries
    FOR EACH ROW
    EXECUTE FUNCTION pricepro.update_updated_at_column();

-- Fix RLS policies for time_entries table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own time entries" ON pricepro.time_entries;
DROP POLICY IF EXISTS "Users can insert their own time entries" ON pricepro.time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON pricepro.time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON pricepro.time_entries;

-- Enable RLS
ALTER TABLE pricepro.time_entries ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies
CREATE POLICY "Users can view their own time entries"
    ON pricepro.time_entries
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries"
    ON pricepro.time_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries"
    ON pricepro.time_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries"
    ON pricepro.time_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON pricepro.time_entries TO authenticated;
GRANT USAGE ON SCHEMA pricepro TO authenticated;
