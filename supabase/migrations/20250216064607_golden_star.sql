/*
  # Crear tablas para planificación de rutinas

  1. Nueva Tabla: planned_workouts
    - Para almacenar las rutinas planificadas
    - Incluye fecha, ejercicios y detalles planificados

  2. Nueva Tabla: workout_comparisons
    - Para comparar rutinas planificadas vs realizadas
    - Almacena métricas de cumplimiento

  3. Seguridad
    - RLS habilitado para ambas tablas
    - Políticas para acceso de usuarios autenticados
*/

-- Tabla para rutinas planificadas
CREATE TABLE IF NOT EXISTS planned_workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  planned_sets integer NOT NULL,
  planned_reps integer NOT NULL,
  planned_weight numeric NOT NULL,
  notes text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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
ALTER TABLE planned_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_comparisons ENABLE ROW LEVEL SECURITY;

-- Políticas para planned_workouts
CREATE POLICY "Usuarios pueden ver sus rutinas planificadas"
  ON planned_workouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus rutinas planificadas"
  ON planned_workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus rutinas planificadas"
  ON planned_workouts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus rutinas planificadas"
  ON planned_workouts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para workout_comparisons
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

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar timestamp
CREATE TRIGGER update_planned_workouts_updated_at
  BEFORE UPDATE ON planned_workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();