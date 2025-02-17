/*
  # Agregar tabla de comparaciones de rutinas

  1. Nueva Tabla
    - `workout_comparisons`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `planned_workout_id` (uuid, foreign key)
      - `actual_workout_id` (uuid, foreign key)
      - `completion_percentage` (numeric)
      - `performance_notes` (text)
      - `created_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS
    - Políticas para ver y crear comparaciones
*/

-- Tabla para comparaciones de rutinas
CREATE TABLE IF NOT EXISTS workout_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  planned_workout_id uuid REFERENCES planned_workouts(id) ON DELETE CASCADE,
  actual_workout_id uuid REFERENCES user_workouts(id) ON DELETE CASCADE,
  completion_percentage numeric,
  performance_notes text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE workout_comparisons ENABLE ROW LEVEL SECURITY;

-- Políticas para workout_comparisons
DROP POLICY IF EXISTS "Usuarios pueden ver sus comparaciones" ON workout_comparisons;
DROP POLICY IF EXISTS "Usuarios pueden crear sus comparaciones" ON workout_comparisons;

CREATE POLICY "Usuarios pueden ver sus comparaciones"
  ON workout_comparisons
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus comparaciones"
  ON workout_comparisons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);