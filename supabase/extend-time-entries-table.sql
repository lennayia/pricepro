-- Extend time_entries table to support client selection
-- Adds client_id so users can track time for clients independently of projects

ALTER TABLE pricepro.time_entries
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES pricepro.clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS category_project_clients JSONB DEFAULT '{}'::jsonb;

-- Create index
CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON pricepro.time_entries(client_id);

-- Add comments
COMMENT ON COLUMN pricepro.time_entries.client_id IS 'Optional client reference - can be set independently of project';
COMMENT ON COLUMN pricepro.time_entries.category_project_clients IS 'Mapping of category -> (projectId -> clientId). Structure: { "categoryKey": { "projectId": "clientId" } }';

-- Note: We use three separate JSONB fields for project tracking:
-- - category_projects: { "categoryKey": ["projectId1", "projectId2"] }
-- - category_project_hours: { "categoryKey": { "projectId": hours } }
-- - category_project_clients: { "categoryKey": { "projectId": "clientId" } }
