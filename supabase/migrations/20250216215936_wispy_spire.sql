-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Lectura de perfil" ON user_profiles;
DROP POLICY IF EXISTS "Actualización de perfil" ON user_profiles;

-- Crear una vista para almacenar los administradores
CREATE VIEW admin_users AS
SELECT id
FROM user_profiles
WHERE is_admin = true;

-- Política de lectura simplificada
CREATE POLICY "Lectura de perfiles"
ON user_profiles FOR SELECT
TO authenticated
USING (
  -- Un usuario siempre puede ver su propio perfil
  id = auth.uid() 
  OR 
  -- Los administradores pueden ver todos los perfiles excepto otros administradores
  (
    auth.uid() IN (SELECT id FROM admin_users)
    AND NOT (id IN (SELECT id FROM admin_users) AND id != auth.uid())
  )
);

-- Política de actualización simplificada
CREATE POLICY "Actualización de perfiles"
ON user_profiles FOR UPDATE
TO authenticated
USING (
  -- Un usuario siempre puede actualizar su propio perfil
  id = auth.uid()
  OR
  -- Los administradores pueden actualizar perfiles de no administradores
  (
    auth.uid() IN (SELECT id FROM admin_users)
    AND NOT (id IN (SELECT id FROM admin_users))
  )
)
WITH CHECK (
  -- Las mismas condiciones que el USING
  id = auth.uid()
  OR
  (
    auth.uid() IN (SELECT id FROM admin_users)
    AND NOT (id IN (SELECT id FROM admin_users))
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
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  );
$$;