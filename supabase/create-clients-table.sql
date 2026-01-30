-- Create clients table
-- Stores clients/customers for projects and time tracking

CREATE TABLE IF NOT EXISTS pricepro.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  logo_url TEXT,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create indexes
CREATE INDEX idx_clients_user_id ON pricepro.clients(user_id);
CREATE INDEX idx_clients_start_date ON pricepro.clients(start_date);
CREATE INDEX idx_clients_end_date ON pricepro.clients(end_date);

-- Add comments
COMMENT ON TABLE pricepro.clients IS 'Clients/customers for tracking work and projects';
COMMENT ON COLUMN pricepro.clients.name IS 'Client name (e.g., "Anna Nováková", "Firma XYZ")';
COMMENT ON COLUMN pricepro.clients.color IS 'Hex color for visual identification';
COMMENT ON COLUMN pricepro.clients.logo_url IS 'URL to client logo in Supabase Storage';
COMMENT ON COLUMN pricepro.clients.start_date IS 'When collaboration started';
COMMENT ON COLUMN pricepro.clients.end_date IS 'When collaboration ended (NULL = ongoing)';
COMMENT ON COLUMN pricepro.clients.notes IS 'Additional notes about the client';

-- Enable RLS
ALTER TABLE pricepro.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own clients"
  ON pricepro.clients
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON pricepro.clients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON pricepro.clients
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON pricepro.clients
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON pricepro.clients
  FOR EACH ROW
  EXECUTE FUNCTION pricepro.update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON pricepro.clients TO authenticated;
