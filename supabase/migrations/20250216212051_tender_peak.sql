/*
  # Admin System Implementation

  1. Changes
    - Add admin column to user_profiles
    - Create admin policies
    - Set up initial admin user

  2. Security
    - Only admins can access admin features
    - Proper RLS policies for admin actions
*/

-- Verificar y agregar columna de administrador
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE user_profiles
    ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Actualizar políticas para user_profiles
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON user_profiles;

CREATE POLICY "Acceso a perfiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Modificación de perfiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Función para promover a admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET is_admin = true
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;