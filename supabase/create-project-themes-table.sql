-- Create project_themes table
-- Stores user-defined themes/categories for projects (chips)
-- Examples: "marketing", "fitness", "daně", "web development"

CREATE TABLE IF NOT EXISTS pricepro.project_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create index
CREATE INDEX idx_project_themes_user_id ON pricepro.project_themes(user_id);

-- Add comments
COMMENT ON TABLE pricepro.project_themes IS 'User-defined themes/categories for projects (displayed as chips)';
COMMENT ON COLUMN pricepro.project_themes.name IS 'Theme name (e.g., "marketing", "fitness", "daně")';
COMMENT ON COLUMN pricepro.project_themes.color IS 'Optional hex color for the chip';

-- Enable RLS
ALTER TABLE pricepro.project_themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own themes"
  ON pricepro.project_themes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own themes"
  ON pricepro.project_themes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own themes"
  ON pricepro.project_themes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own themes"
  ON pricepro.project_themes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_project_themes_updated_at
  BEFORE UPDATE ON pricepro.project_themes
  FOR EACH ROW
  EXECUTE FUNCTION pricepro.update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON pricepro.project_themes TO authenticated;
