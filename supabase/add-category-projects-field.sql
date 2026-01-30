-- Add category_projects field to time_entries for mapping categories to projects
-- This replaces the simple project_name field with a flexible JSON mapping

-- Add the new JSONB field
ALTER TABLE pricepro.time_entries
ADD COLUMN IF NOT EXISTS category_projects JSONB DEFAULT '{}'::jsonb;

-- Create index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_time_entries_category_projects
  ON pricepro.time_entries USING GIN (category_projects);

COMMENT ON COLUMN pricepro.time_entries.category_projects IS 'JSON mapping of category keys to project IDs, e.g. {"billable_work": "uuid", "content_creation": "uuid"}';

-- Optional: Migrate existing project_name data to category_projects
-- This assumes project_name was used for all work categories
-- You can customize this migration based on your needs
UPDATE pricepro.time_entries
SET category_projects = jsonb_build_object(
  'billable_work',
  CASE
    WHEN project_name IS NOT NULL THEN project_name
    ELSE NULL
  END
)
WHERE project_name IS NOT NULL
  AND (category_projects IS NULL OR category_projects = '{}'::jsonb);

-- Note: We keep project_name column for backward compatibility
-- but category_projects is now the primary source of truth
