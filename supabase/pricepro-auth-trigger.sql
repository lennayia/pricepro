-- ============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================
-- This trigger automatically creates a pricepro.users record
-- when a new user signs up via auth.users

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION pricepro.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pricepro.users (id, email, first_name, last_name, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION pricepro.handle_new_user();
