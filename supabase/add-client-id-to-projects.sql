-- Add client_id to projects table
-- Projects can now be linked to specific clients

ALTER TABLE pricepro.projects
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES pricepro.clients(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON pricepro.projects(client_id);

-- Add comment
COMMENT ON COLUMN pricepro.projects.client_id IS 'Optional reference to client - which client is this project for?';
