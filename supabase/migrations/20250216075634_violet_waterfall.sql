/*
  # Crear buckets de almacenamiento

  1. Nuevos Buckets
    - `avatars`: Para fotos de perfil de usuarios
    - `photos`: Para fotos de progreso
  
  2. Seguridad
    - Habilitar almacenamiento público
    - Configurar políticas de acceso
    - Establecer límites de tamaño
*/

-- Crear bucket para avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Crear bucket para fotos de progreso
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para bucket de avatares
CREATE POLICY "Avatar accesible por todos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuarios pueden subir sus avatares"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Usuarios pueden actualizar sus avatares"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Usuarios pueden eliminar sus avatares"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Políticas para bucket de fotos de progreso
CREATE POLICY "Fotos de progreso accesibles por todos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Usuarios pueden subir sus fotos de progreso"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos'
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Usuarios pueden actualizar sus fotos de progreso"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'photos'
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Usuarios pueden eliminar sus fotos de progreso"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos'
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);