-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Lectura básica" ON user_profiles;
DROP POLICY IF EXISTS "Lectura administrativa" ON user_profiles;
DROP POLICY IF EXISTS "Actualización propia" ON user_profiles;
DROP POLICY IF EXISTS "Gestión administrativa" ON user_profiles;

-- Eliminar vista materializada y trigger si existen
DROP TRIGGER IF EXISTS refresh_admin_cache_trigger ON user_profiles;
DROP MATERIALIZED VIEW IF EXISTS admin_cache;

-- Crear políticas simples y no recursivas
CREATE POLICY "Lectura de perfil"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    (SELECT p.is_admin FROM user_profiles p WHERE p.id = auth.uid())
  );

CREATE POLICY "Actualización de perfil"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    (SELECT p.is_admin FROM user_profiles p WHERE p.id = auth.uid())
  )
  WITH CHECK (
    CASE
      WHEN id = auth.uid() THEN true
      WHEN (SELECT p.is_admin FROM user_profiles p WHERE p.id = auth.uid()) THEN true
      ELSE false
    END
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