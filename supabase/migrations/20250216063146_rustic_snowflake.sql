/*
  # Create exercises table and seed data

  1. New Tables
    - `exercises`
      - `id` (uuid, primary key)
      - `name` (text)
      - `muscle_group` (text)
      - `description` (text)
      - `difficulty` (text)
      - `instructions` (text[])
      - `muscles` (text[])
      - `tips` (text[])
      - `duration` (text)
      - `equipment` (text[])
      - `image_url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for authenticated users to read exercises
*/

CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  muscle_group text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Principiante', 'Intermedio', 'Avanzado')),
  instructions text[] NOT NULL,
  muscles text[] NOT NULL,
  tips text[] NOT NULL,
  duration text NOT NULL,
  equipment text[] NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Política de lectura para usuarios autenticados
CREATE POLICY "Ejercicios visibles para usuarios autenticados"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (true);

  # Insertar da