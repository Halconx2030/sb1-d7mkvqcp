-- Agregar columna de administrador a los perfiles de usuario
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;