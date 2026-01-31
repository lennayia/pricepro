-- Add track_personal_time setting to users table
-- Allows users to choose whether they want to track personal time or only work time

ALTER TABLE pricepro.users
ADD COLUMN IF NOT EXISTS track_personal_time BOOLEAN DEFAULT true;

COMMENT ON COLUMN pricepro.users.track_personal_time IS 'Whether user wants to track personal time categories (sleep, family, pets, fun). If false, only work categories are shown in tracker.';

-- Set existing users to true (keep current behavior)
UPDATE pricepro.users
SET track_personal_time = true
WHERE track_personal_time IS NULL;
