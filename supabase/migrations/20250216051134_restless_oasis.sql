/*
  # Esquema inicial para Mi Rutina Fitness

  1. Nuevas Tablas
    - `exercises` - Catálogo de ejercicios disponibles
      - `id` (uuid, primary key)
      - `name` (text) - Nombre del ejercicio
      - `muscle_group` (text) - Grupo muscular
      - `description` (text) - Descripción del ejercicio
      - `difficulty` (text) - Nivel de dificultad
      - `instructions` (text[]) - Lista de instrucciones
      - `image_url` (text) - URL de la imagen
      - `created_at` (timestamptz)

    - `user_workouts` - Registros de ejercicios realizados por usuarios
      - `id` (uuid, primary key)
      - `user_id` (uuid) - ID del usuario
      - `exercise_id` (uuid) - Referencia al ejercicio
      - `date` (timestamptz) - Fecha del ejercicio
      - `sets` (int) - Número de series
      - `reps` (int) - Repeticiones por serie
      - `weight` (numeric) - Peso utilizado
      - `notes` (text) - Notas adicionales
      - `photo_url` (text) - URL de la foto del ejercicio
      - `created_at` (timestamptz)

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas para lectura y escritura basadas en autenticación
*/

-- Crear tabla de ejercicios
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  muscle_group text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL,
  instructions text[] NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de entrenamientos de usuario
CREATE TABLE IF NOT EXISTS user_workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  date timestamptz NOT NULL DEFAULT now(),
  sets integer NOT NULL,
  reps integer NOT NULL,
  weight numeric NOT NULL,
  notes text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workouts ENABLE ROW LEVEL SECURITY;

-- Políticas para exercises
CREATE POLICY "Ejercicios visibles para todos"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para user_workouts
CREATE POLICY "Usuarios pueden ver sus propios entrenamientos"
  ON user_workouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propios entrenamientos"
  ON user_workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios entrenamientos"
  ON user_workouts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios entrenamientos"
  ON user_workouts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);