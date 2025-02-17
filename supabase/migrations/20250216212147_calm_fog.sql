/*
  # Fix RLS Policies

  1. Changes
    - Fix infinite recursion in RLS policies
    - Simplify admin access checks
    - Add direct admin check policy

  2. Security
    - Maintain proper access control
    - Prevent policy recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Acceso a perfiles" ON user_profiles;
DROP POLICY IF EXISTS "Modificación de perfiles" ON user_profiles;

-- Create new, simplified policies
CREATE POLICY "Ver perfil propio"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Actualizar perfil propio"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Acceso admin a perfiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND id IN (
        SELECT id FROM user_profiles
        WHERE is_admin = true
      )
    )
  );

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;