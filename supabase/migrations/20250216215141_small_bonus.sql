-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Lectura de perfiles" ON user_profiles;
DROP POLICY IF EXISTS "Modificación de perfil propio" ON user_profiles;
DROP POLICY IF EXISTS "Gestión administrativa" ON user_profiles;

-- Política para lectura
CREATE POLICY "Lectura de perfiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid())
  );

-- Política para actualización
CREATE POLICY "Actualización de perfiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    id = auth.uid() OR
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid())
  );

-- Política para inserción
CREATE POLICY "Inserción de perfiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Política para eliminación
CREATE POLICY "Eliminación de perfiles"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid())
  );

-- Función para verificar admin
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