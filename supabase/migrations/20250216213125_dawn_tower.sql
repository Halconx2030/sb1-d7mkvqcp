/*
  # Fix RLS Policies for User Profiles

  1. Changes
    - Drop existing problematic policies
    - Create simplified non-recursive policies
    - Update admin check function
    - Ensure proper access control

  2. Security
    - Maintain data isolation
    - Prevent policy recursion
    - Preserve admin functionality
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Usuario lee perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuario actualiza perfil" ON user_profiles;
DROP POLICY IF EXISTS "Admin gestiona perfiles" ON user_profiles;

-- Create simplified user access policies
CREATE POLICY "Usuario ve perfil"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    is_admin = true
  );

CREATE POLICY "Usuario modifica perfil"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create non-recursive admin policy
CREATE POLICY "Admin gestiona usuarios"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    CASE 
      WHEN id = auth.uid() THEN true
      ELSE EXISTS (
        SELECT 1
        FROM user_profiles admin
        WHERE admin.id = auth.uid()
        AND admin.is_admin = true
      )
    END
  );

-- Update admin check function to be more efficient
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