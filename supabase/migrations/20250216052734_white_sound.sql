/*
  # Ajuste de políticas para perfiles de usuario

  1. Cambios
    - Agregar política de inserción para perfiles de usuario
    - Agregar trigger para crear perfil automáticamente al registrar usuario
    - Ajustar políticas existentes para mejor manejo de permisos

  2. Seguridad
    - Mantener RLS habilitado
    - Asegurar que los usuarios solo puedan acceder a sus propios datos
    - Permitir la creación automática de perfiles
*/

-- Ajustar políticas para user_profiles
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON user_profiles;

CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden insertar su propio perfil"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil al registrar usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();