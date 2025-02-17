/*
  # Ajustes para el perfil de usuario

  1. Cambios
    - Asegurar que la tabla user_profiles existe
    - Ajustar las políticas de seguridad
    - Mejorar el trigger de creación de perfil

  2. Seguridad
    - Mantener RLS habilitado
    - Asegurar acceso correcto a los perfiles
*/

-- Asegurarse de que la tabla existe
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  weight numeric,
  height numeric,
  experience_level text CHECK (experience_level IN ('Principiante', 'Intermedio', 'Avanzado')),
  fitness_goals text[],
  preferred_workout_days text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON user_profiles;

-- Crear nuevas políticas
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden insertar su propio perfil"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Mejorar la función de creación de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurarse de que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();