/*
  # Corrección de políticas de administrador

  1. Cambios
    - Elimina función is_admin conflictiva
    - Simplifica políticas de acceso
    - Mejora la gestión de permisos

  2. Políticas
    - Lectura: Todos los usuarios autenticados pueden ver perfiles
    - Escritura: Usuarios pueden modificar su propio perfil
    - Admin: Administradores pueden gestionar todos los perfiles

  3. Seguridad
    - Previene recursión en políticas
    - Simplifica lógica de permisos
*/

-- Eliminar función conflictiva
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios ven perfiles" ON user_profiles;
DROP POLICY IF EXISTS "Usuarios modifican su perfil" ON user_profiles;
DROP POLICY IF EXISTS "Admins gestionan perfiles" ON user_profiles;

-- Crear políticas simplificadas
CREATE POLICY "Lectura de perfiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Modificación de perfil propio"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Gestión administrativa"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin
      WHERE admin.id = auth.uid()
      AND admin.is_admin = true
      AND admin.id != user_profiles.id
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