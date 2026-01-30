-- Create projects table for managing clients and projects
CREATE TABLE IF NOT EXISTS pricepro.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_project_name UNIQUE(user_id, name)
);

COMMENT ON TABLE pricepro.projects IS 'User projects and clients for time tracking';
COMMENT ON COLUMN pricepro.projects.name IS 'Project or client name';
COMMENT ON COLUMN pricepro.projects.color IS 'Optional color for visual distinction (hex code)';
COMMENT ON COLUMN pricepro.projects.is_archived IS 'Whether the project is archived (hidden from active lists)';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON pricepro.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_active ON pricepro.projects(user_id, is_archived) WHERE is_archived = FALSE;

-- Enable RLS
ALTER TABLE pricepro.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own projects"
  ON pricepro.projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON pricepro.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON pricepro.projects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON pricepro.projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION pricepro.update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON pricepro.projects
  FOR EACH ROW
  EXECUTE FUNCTION pricepro.update_projects_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON pricepro.projects TO authenticated;
