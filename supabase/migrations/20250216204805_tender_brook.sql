-- Agregar columna de nivel de acceso a los perfiles de usuario
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS access_level text CHECK (access_level IN ('basic', 'premium', 'pro'));

-- Actualizar la función de creación de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    full_name,
    access_level,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'basic',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;