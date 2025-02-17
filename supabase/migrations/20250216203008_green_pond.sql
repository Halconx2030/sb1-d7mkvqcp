/*
  # Agregar campo de administrador a perfiles de usuario

  1. Cambios
    - Agregar campo `is_admin` a la tabla `user_profiles`
    - Valor por defecto: false
    - No permite valores nulos
*/

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;