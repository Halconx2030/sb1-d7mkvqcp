-- Roles de usuario
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  permissions jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Registro de sesiones
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  last_active timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Registro de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Actualizar perfiles de usuario
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES user_roles(id),
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]';

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Solo administradores pueden ver roles" ON user_roles;
DROP POLICY IF EXISTS "Solo administradores pueden modificar roles" ON user_roles;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias sesiones" ON user_sessions;
DROP POLICY IF EXISTS "Usuarios pueden gestionar sus propias sesiones" ON user_sessions;
DROP POLICY IF EXISTS "Solo administradores pueden ver logs" ON audit_logs;
DROP POLICY IF EXISTS "Sistema puede crear logs" ON audit_logs;

-- Políticas para roles
CREATE POLICY "Solo administradores pueden ver roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Solo administradores pueden modificar roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Políticas para sesiones
CREATE POLICY "Usuarios pueden ver sus propias sesiones"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Usuarios pueden gestionar sus propias sesiones"
  ON user_sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Políticas para logs de auditoría
CREATE POLICY "Solo administradores pueden ver logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Sistema puede crear logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insertar roles básicos
INSERT INTO user_roles (name, description, permissions) VALUES
('root', 'Acceso total al sistema', '["*"]'),
('admin', 'Administrador del sistema', '["users.view", "users.edit", "exercises.manage", "stats.view"]'),
('moderator', 'Moderador de contenido', '["exercises.view", "exercises.edit", "stats.view"]')
ON CONFLICT (name) DO NOTHING;

-- Eliminar triggers existentes para evitar conflictos
DROP TRIGGER IF EXISTS log_user_profiles_changes ON user_profiles;
DROP TRIGGER IF EXISTS log_user_roles_changes ON user_roles;

-- Función para registrar acciones
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, details)
  VALUES (
    auth.uid(),
    TG_OP,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'old_data', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE null END,
      'new_data', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE null END
    )
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para auditoría
CREATE TRIGGER log_user_profiles_changes
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER log_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();