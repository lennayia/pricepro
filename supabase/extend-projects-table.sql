-- Extend projects table with additional fields
-- Adds: type (vlastnosti), theme, status, dates

ALTER TABLE pricepro.projects
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'other' CHECK (type IN ('billable', 'scalable', 'other')),
ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES pricepro.project_themes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_theme_id ON pricepro.projects(theme_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON pricepro.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON pricepro.projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_end_date ON pricepro.projects(end_date);

-- Add comments
COMMENT ON COLUMN pricepro.projects.type IS 'Project type: billable (fakturovatelný 1:1), scalable (škálovatelný), other (ostatní)';
COMMENT ON COLUMN pricepro.projects.theme_id IS 'Optional theme/category (FK to project_themes)';
COMMENT ON COLUMN pricepro.projects.status IS 'Project status: active, paused, completed, cancelled';
COMMENT ON COLUMN pricepro.projects.start_date IS 'When project started';
COMMENT ON COLUMN pricepro.projects.end_date IS 'When project ended (NULL = ongoing)';
