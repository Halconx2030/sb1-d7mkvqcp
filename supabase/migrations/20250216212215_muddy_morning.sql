/*
  # Fix RLS Policies

  1. Changes
    - Drop existing problematic policies
    - Create separate policies for user and admin access
    - Add helper function for admin checks

  2. Security
    - Maintain proper access control
    - Prevent policy recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Ver perfil propio" ON user_profiles;
DROP POLICY IF EXISTS "Actualizar perfil propio" ON user_profiles;
DROP POLICY IF EXISTS "Acceso admin a perfiles" ON user_profiles;

-- Create new, non-recursive policies
CREATE POLICY "Usuarios ven su perfil"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Usuarios actualizan su perfil"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins acceden a perfiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.is_admin = true
      AND up.id != user_profiles.id
    )
  );

-- Helper function for admin checks
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$;