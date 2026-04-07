-- SUPABASE STORAGE BUCKET CREATION & PERMISSIONS SETUP

-- 1. Create the necessary storage buckets for the FMF Platform
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('fmf-media', 'fmf-media', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to prevent "duplicate policy" errors if modifying
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Delete Access" ON storage.objects;

DROP POLICY IF EXISTS "Media Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Media Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Media Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Media Delete Access" ON storage.objects;

DROP POLICY IF EXISTS "FMF Media Public Access" ON storage.objects;
DROP POLICY IF EXISTS "FMF Media Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "FMF Media Update Access" ON storage.objects;
DROP POLICY IF EXISTS "FMF Media Delete Access" ON storage.objects;

-- 3. Storage Policies for 'avatars'
CREATE POLICY "Avatar Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Avatar Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);
CREATE POLICY "Avatar Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- 4. Storage Policies for 'media'
CREATE POLICY "Media Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Media Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Media Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.uid() = owner);
CREATE POLICY "Media Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.uid() = owner);

-- 5. Storage Policies for 'fmf-media'
CREATE POLICY "FMF Media Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'fmf-media');
CREATE POLICY "FMF Media Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fmf-media' AND auth.role() = 'authenticated');
CREATE POLICY "FMF Media Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'fmf-media' AND auth.uid() = owner);
CREATE POLICY "FMF Media Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'fmf-media' AND auth.uid() = owner);
