/*
  # Agregar tablas para perfiles y seguimiento

  1. Nuevas Tablas
    - `user_profiles`
      - Información personal del usuario
      - Objetivos y preferencias
      - Medidas corporales
    - `user_goals`
      - Metas personalizadas
      - Seguimiento de progreso
    - `user_routines`
      - Rutinas personalizadas
      - Programación semanal
    - `progress_photos`
      - Fotos de seguimiento
      - Comparación temporal
    - `achievements`
      - Sistema de logros
      - Medallas y recompensas

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas para acceso personal
*/

-- Perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  weight numeric,
  height numeric,
  experience_level text CHECK (experience_level IN ('Principiante', 'Intermedio', 'Avanzado')),
  fitness_goals text[],
  preferred_workout_days text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Metas de usuario
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_value numeric,
  current_value numeric DEFAULT 0,
  unit text,
  deadline timestamptz,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Rutinas personalizadas
CREATE TABLE IF NOT EXISTS user_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  schedule jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fotos de progreso
CREATE TABLE IF NOT EXISTS progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  weight numeric,
  notes text,
  taken_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Logros y medallas
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  badge_url text,
  achieved_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Políticas para user_goals
CREATE POLICY "Usuarios pueden ver sus propias metas"
  ON user_goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias metas"
  ON user_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias metas"
  ON user_goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para user_routines
CREATE POLICY "Usuarios pueden ver sus propias rutinas"
  ON user_routines
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias rutinas"
  ON user_routines
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias rutinas"
  ON user_routines
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para progress_photos
CREATE POLICY "Usuarios pueden ver sus propias fotos"
  ON progress_photos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden subir sus propias fotos"
  ON progress_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas para achievements
CREATE POLICY "Usuarios pueden ver sus propios logros"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propios logros"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);