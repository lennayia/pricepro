# Setup Supabase Storage pro loga projektů

## 1. Vytvoření Storage Bucket

V Supabase Dashboard:
1. Jdi do **Storage** → **Create a new bucket**
2. Nastavení:
   - **Name:** `project-logos`
   - **Public bucket:** ✅ Ano (pro snadné zobrazování)
   - **File size limit:** 50 KB
   - **Allowed MIME types:** `image/png`, `image/jpeg`, `image/jpg`, `image/webp`, `image/heic`, `image/heif`

## 2. RLS Policies pro bucket

### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Authenticated users can upload project logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-logos' AND
  -- User can only upload to their own user folder
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 2: Allow authenticated users to update their logos
```sql
CREATE POLICY "Users can update own project logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 3: Allow authenticated users to delete their logos
```sql
CREATE POLICY "Users can delete own project logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 4: Allow public read access
```sql
CREATE POLICY "Public can view project logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-logos');
```

## 3. Struktura složek

Loga budou ukládána ve struktuře:
```
project-logos/
  {user_id}/
    {project_id}.png
    {project_id}.jpg
    {project_id}.webp
```

## 4. Omezení obrázků

Frontend bude kontrolovat:
- **Maximální velikost:** 50 KB
- **Rozměry:** max 50×50 px
- **Formáty:** PNG, JPG, JPEG, WEBP, HEIC

## 5. Příklad URL

Po uploadu bude logo dostupné na:
```
https://{project-ref}.supabase.co/storage/v1/object/public/project-logos/{user_id}/{project_id}.png
```
