-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880 -- 5MB
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- Create photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'photos',
  'photos',
  true,
  5242880 -- 5MB
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- Remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Avatar accesible por todos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir sus avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus avatares" ON storage.objects;
DROP POLICY IF EXISTS "Fotos de progreso accesibles por todos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir sus fotos de progreso" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus fotos de progreso" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus fotos de progreso" ON storage.objects;

-- Policies for avatars
CREATE POLICY "Avatar accesible por todos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuarios pueden subir sus avatares"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Usuarios pueden actualizar sus avatares"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Usuarios pueden eliminar sus avatares"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
);

-- Policies for progress photos
CREATE POLICY "Fotos de progreso accesibles por todos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Usuarios pueden subir sus fotos de progreso"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Usuarios pueden actualizar sus fotos de progreso"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'photos'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Usuarios pueden eliminar sus fotos de progreso"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos'
  AND auth.uid() IS NOT NULL
);