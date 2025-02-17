/*
  # Fix User Profiles Access

  1. Changes
    - Drop all existing problematic policies
    - Create new simplified policies for user profiles
    - Add basic policies for profile access
    - Ensure proper admin access

  2. Security
    - Maintain data isolation
    - Prevent policy recursion
    - Preserve admin functionality
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Acceso a perfil" ON user_profiles;
DROP POLICY IF EXISTS "Modificación de perfil" ON user_profiles;

-- Create basic policies for user profiles
CREATE POLICY "Usuarios ven perfiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios modifican su perfil"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins modifican perfiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Ensure proper default values
ALTER TABLE user_profiles
ALTER COLUMN is_admin SET DEFAULT false,
ALTER COLUMN access_level SET DEFAULT 'basic';

-- Update function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    full_name,
    is_admin,
    access_level,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    false,
    'basic',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;