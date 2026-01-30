-- Add logo_url column to projects table
-- Stores URL to uploaded logo image in Supabase Storage

ALTER TABLE pricepro.projects
ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN pricepro.projects.logo_url IS 'URL to project logo image stored in Supabase Storage. If null, use color instead.';

-- Create Storage bucket for project logos (run this in Supabase Dashboard > Storage)
-- Bucket name: project-logos
-- Public: true (for easy display)
-- File size limit: 50KB
-- Allowed MIME types: image/png, image/jpeg, image/jpg, image/webp, image/heic, image/heif

-- RLS policies for Storage bucket (run after creating bucket):
-- 1. Allow authenticated users to upload their own project logos
-- 2. Allow public read access for displaying logos

-- Note: Storage policies are set in Supabase Dashboard > Storage > project-logos > Policies
