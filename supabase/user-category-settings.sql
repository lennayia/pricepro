-- Create user_category_settings table
CREATE TABLE IF NOT EXISTS pricepro.user_category_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_key TEXT NOT NULL,
  category_type TEXT NOT NULL DEFAULT 'other' CHECK (category_type IN ('billable', 'scalable', 'other')),
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_key)
);

COMMENT ON TABLE pricepro.user_category_settings IS 'User preferences for time tracking category classification';
COMMENT ON COLUMN pricepro.user_category_settings.category_type IS 'billable = fakturovatelná 1:1 práce, scalable = škálovatelná investice (produkty, kurzy), other = ostatní (overhead, admin)';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_category_settings_user_id ON pricepro.user_category_settings(user_id);

-- Enable RLS
ALTER TABLE pricepro.user_category_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own category settings"
  ON pricepro.user_category_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category settings"
  ON pricepro.user_category_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category settings"
  ON pricepro.user_category_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION pricepro.update_user_category_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_category_settings_updated_at
  BEFORE UPDATE ON pricepro.user_category_settings
  FOR EACH ROW
  EXECUTE FUNCTION pricepro.update_user_category_settings_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON pricepro.user_category_settings TO authenticated;

-- Create function to initialize default settings for new users
CREATE OR REPLACE FUNCTION pricepro.initialize_category_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Default: billable_work is billable, rest is 'other'
  INSERT INTO pricepro.user_category_settings (user_id, category_key, category_type, display_order)
  VALUES
    (NEW.id, 'client_communication', 'other', 1),
    (NEW.id, 'content_creation', 'other', 2),
    (NEW.id, 'social_media', 'other', 3),
    (NEW.id, 'administration', 'other', 4),
    (NEW.id, 'messages', 'other', 5),
    (NEW.id, 'education', 'other', 6),
    (NEW.id, 'billable_work', 'billable', 7),
    (NEW.id, 'digital_products', 'other', 8),
    (NEW.id, 'other', 'other', 9)
  ON CONFLICT (user_id, category_key) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize settings for new users
DROP TRIGGER IF EXISTS initialize_user_category_settings ON pricepro.users;
CREATE TRIGGER initialize_user_category_settings
  AFTER INSERT ON pricepro.users
  FOR EACH ROW
  EXECUTE FUNCTION pricepro.initialize_category_settings();
