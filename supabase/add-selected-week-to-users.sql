-- Add selected_week_start column to users table
-- This allows users to persist their selected week across devices and sessions

ALTER TABLE pricepro.users
ADD COLUMN IF NOT EXISTS selected_week_start DATE;

COMMENT ON COLUMN pricepro.users.selected_week_start IS 'Currently selected week start date (Monday) for time tracking. NULL means use current week.';

-- Create index for faster lookups (optional, but good practice)
CREATE INDEX IF NOT EXISTS idx_users_selected_week_start
  ON pricepro.users(selected_week_start)
  WHERE selected_week_start IS NOT NULL;

-- No default value - NULL means "use current week"
-- Users can explicitly select a week, which will be saved here
