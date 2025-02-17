/*
  # Fix RLS Policies for User Profiles

  1. Changes
    - Drop existing problematic policies
    - Create separate policies for user and admin access
    - Add helper function for admin checks
    - Prevent recursion in policy checks

  2. Security
    - Maintain proper access control
    - Prevent policy recursion
    - Ensure admin functionality
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Usuarios ven su perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuarios actualizan su perfil" ON user_profiles;
DROP POLICY IF EXISTS "Admins acceden a perfiles" ON user_profiles;

-- Create new, non-recursive policies
CREATE POLICY "Ver perfil propio"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Actualizar perfil propio"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Acceso admin"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users u
      JOIN user_profiles p ON u.id = p.id
      WHERE u.id = auth.uid()
      AND p.is_admin = true
      AND p.id != user_profiles.id
    )
  );

-- Helper function for admin checks
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT p.is_admin INTO is_admin
  FROM auth.users u
  JOIN user_profiles p ON u.id = p.id
  WHERE u.id = auth.uid();
  
  RETURN COALESCE(is_admin, false);
END;
$$;