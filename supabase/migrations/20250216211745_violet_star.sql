/*
  # Agregar nivel de acceso a perfiles de usuario

  1. Cambios
    - Agregar columna `access_level` a la tabla `user_profiles`
    - Actualizar función `handle_new_user` para establecer nivel básico por defecto

  2. Notas
    - El nivel de acceso puede ser: basic, premium, o pro
    - Los nuevos usuarios comienzan con nivel básico
*/

-- Verificar si la columna ya existe antes de agregarla
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'access_level'
  ) THEN
    ALTER TABLE user_profiles
    ADD COLUMN access_level text CHECK (access_level IN ('basic', 'premium', 'pro'));
  END IF;
END $$;

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
  ON CONFLICT (id) DO UPDATE SET
    access_level = EXCLUDED.access_level
    WHERE user_profiles.access_level IS NULL;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;