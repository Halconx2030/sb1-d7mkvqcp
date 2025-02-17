-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Lectura de perfil" ON user_profiles;
DROP POLICY IF EXISTS "Actualización de perfil" ON user_profiles;

-- Crear políticas simples y directas
CREATE POLICY "Lectura de perfil"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
      AND p.id != user_profiles.id
    )
  );

CREATE POLICY "Actualización de perfil"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
      AND p.id != user_profiles.id
    )
  )
  WITH CHECK (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
      AND p.id != user_profiles.id
    )
  );

-- Función optimizada para verificar admin
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin
     FROM user_profiles
     WHERE id = auth.uid()
     LIMIT 1),
    false
  );
$$;