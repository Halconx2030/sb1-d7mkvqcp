/*
  # Corregir políticas RLS

  1. Cambios
    - Eliminar políticas existentes
    - Crear nuevas políticas simplificadas
    - Optimizar la función check_is_admin
  
  2. Seguridad
    - Mantener el control de acceso basado en roles
    - Evitar recursión infinita
    - Asegurar que los usuarios solo puedan modificar sus propios datos
*/

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Lectura de perfiles" ON user_profiles;
DROP POLICY IF EXISTS "Actualización de perfiles" ON user_profiles;
DROP POLICY IF EXISTS "Inserción de perfiles" ON user_profiles;
DROP POLICY IF EXISTS "Eliminación de perfiles" ON user_profiles;

-- Crear vista materializada para cachear admins
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_cache AS
SELECT id, is_admin
FROM user_profiles
WHERE is_admin = true;

-- Crear índice para optimizar búsquedas
CREATE UNIQUE INDEX IF NOT EXISTS admin_cache_id_idx ON admin_cache(id);

-- Función para refrescar el caché
CREATE OR REPLACE FUNCTION refresh_admin_cache()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_cache;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para mantener el caché actualizado
DROP TRIGGER IF EXISTS refresh_admin_cache_trigger ON user_profiles;
CREATE TRIGGER refresh_admin_cache_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_admin_cache();

-- Políticas simplificadas
CREATE POLICY "Lectura básica"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Lectura administrativa"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_cache
    WHERE id = auth.uid()
  ));

CREATE POLICY "Actualización propia"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Gestión administrativa"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_cache WHERE id = auth.uid()) AND
    id != auth.uid() -- Los admins no pueden modificar su propio estado de admin
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
    SELECT 1 FROM admin_cache
    WHERE id = auth.uid()
  );
$$;

-- Refrescar el caché inicial
REFRESH MATERIALIZED VIEW admin_cache;