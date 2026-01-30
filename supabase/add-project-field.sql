-- Add optional project_name field to time_entries
ALTER TABLE pricepro.time_entries
ADD COLUMN IF NOT EXISTS project_name TEXT;

-- Create index for filtering by project
CREATE INDEX IF NOT EXISTS idx_time_entries_project_name
  ON pricepro.time_entries(user_id, project_name)
  WHERE project_name IS NOT NULL;

COMMENT ON COLUMN pricepro.time_entries.project_name IS 'Optional project/client name for grouping related work';
