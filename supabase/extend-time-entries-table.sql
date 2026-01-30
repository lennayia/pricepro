-- Extend time_entries table to support client selection
-- Adds client_id so users can track time for clients independently of projects

ALTER TABLE pricepro.time_entries
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES pricepro.clients(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON pricepro.time_entries(client_id);

-- Add comment
COMMENT ON COLUMN pricepro.time_entries.client_id IS 'Optional client reference - can be set independently of project';

-- Note: category_projects JSONB field will store both project_id and client_id per category
-- Structure: { "category_key": [{ "project_id": "uuid", "client_id": "uuid", "hours": 2.5 }] }
