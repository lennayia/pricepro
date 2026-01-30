-- Add category_project_hours field to time_entries table
-- This allows users to split hours for a single category across multiple projects
-- Example: 5h "Komunikace s klienty" = 2h for Project A + 3h for Project B

-- Format: { "category_key": { "project_id": hours, "project_id2": hours2 } }
-- Example:
-- {
--   "client_communication": {
--     "uuid-project-1": 2,
--     "uuid-project-2": 3
--   },
--   "billable_work": {
--     "uuid-project-3": 5
--   }
-- }

ALTER TABLE pricepro.time_entries
ADD COLUMN IF NOT EXISTS category_project_hours JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN pricepro.time_entries.category_project_hours IS 'Rozdělení hodin kategorie mezi více projektů. Formát: {category_key: {project_id: hours}}';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_time_entries_category_project_hours
  ON pricepro.time_entries USING GIN (category_project_hours);

-- Note: This field is OPTIONAL
-- If empty, the system falls back to category_projects (one project per category)
-- If filled, it takes precedence over category_projects for that category
