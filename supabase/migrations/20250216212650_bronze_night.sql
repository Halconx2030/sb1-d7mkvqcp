/*
  # Fix RLS Policies

  1. Changes
    - Drop existing problematic policies
    - Create simplified policies for user access
    - Add non-recursive admin access policy
    - Update helper functions

  2. Security
    - Maintain proper access control
    - Prevent policy recursion
    - Ensure admin functionality
*/

-- Drop existing problematic policies
-- Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Ver perfil propio" ON user_profiles;
DROP POLICY IF EXISTS "Actualizar perfil propio" ON user_profiles;
DROP POLICY IF EXISTS "Acceso admin" ON user_profiles;

-- Crear políticas simplificadas para usuarios
CREATE POLICY "Usuario lee perfil"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Usuario actualiza perfil"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Crear política no recursiva para administradores
CREATE POLICY "Admin gestiona perfiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    id = auth.uid() OR public.check_is_admin()
  )
  WITH CHECK (
    id = auth.uid() OR public.check_is_admin()
  );

-- Actualizar función para verificar si el usuario es administrador
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
$$;