/*
  # Actualizar tabla de ejercicios e insertar datos

  1. Cambios en la Estructura
    - Agregar columnas faltantes a la tabla exercises:
      - muscles (array de texto)
      - tips (array de texto)
      - duration (texto)
      - equipment (array de texto)

  2. Datos
    - Insertar ejercicios predefinidos para todos los grupos musculares
*/

-- Primero, agregar las columnas faltantes
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS muscles text[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tips text[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT '30 minutos',
ADD COLUMN IF NOT EXISTS equipment text[] NOT NULL DEFAULT '{}';

-- Luego, insertar los datos
INSERT INTO exercises (name, muscle_group, description, difficulty, instructions, muscles, tips, duration, equipment, image_url) VALUES
-- Pecho
(
  'Press de Banca',
  'Pecho',
  'Ejercicio fundamental para desarrollar la fuerza y el tamaño del pecho',
  'Intermedio',
  ARRAY[
    'Acuéstate en el banco con los pies planos en el suelo',
    'Agarra la barra con un agarre ligeramente más ancho que los hombros',
    'Baja la barra controladamente hasta tocar el pecho',
    'Empuja la barra hacia arriba hasta extender los brazos'
  ],
  ARRAY['Pectoral mayor', 'Pectoral menor', 'Deltoides anterior', 'Tríceps'],
  ARRAY[
    'Mantén los hombros hacia atrás y abajo',
    'No rebotes la barra en el pecho',
    'Mantén las muñecas rectas'
  ],
  '45-60 minutos',
  ARRAY['Barra', 'Banco plano', 'Discos'],
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
),
(
  'Press Inclinado con Mancuernas',
  'Pecho',
  'Excelente para desarrollar la parte superior del pecho',
  'Intermedio',
  ARRAY[
    'Ajusta el banco a 30-45 grados',
    'Siéntate con una mancuerna en cada mano',
    'Presiona las mancuernas hacia arriba',
    'Baja controladamente hasta la posición inicial'
  ],
  ARRAY['Pectoral superior', 'Deltoides anterior', 'Tríceps'],
  ARRAY[
    'Mantén los codos a 45 grados del cuerpo',
    'No dejes caer las mancuernas demasiado abajo',
    'Controla el movimiento en todo momento'
  ],
  '30-45 minutos',
  ARRAY['Mancuernas', 'Banco inclinado'],
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
),

-- Espalda
(
  'Dominadas',
  'Espalda',
  'Ejercicio compuesto que desarrolla la fuerza y anchura de la espalda',
  'Avanzado',
  ARRAY[
    'Agarra la barra con las palmas hacia adelante',
    'Cuelga con los brazos extendidos',
    'Tira de tu cuerpo hacia arriba hasta que tu barbilla supere la barra',
    'Baja controladamente'
  ],
  ARRAY['Dorsal ancho', 'Romboides', 'Bíceps', 'Core'],
  ARRAY[
    'Mantén el core activado',
    'No uses impulso',
    'Respira de manera controlada'
  ],
  '30-40 minutos',
  ARRAY['Barra de dominadas'],
  'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80'
),
(
  'Peso Muerto',
  'Espalda',
  'Ejercicio fundamental para desarrollar fuerza en toda la cadena posterior',
  'Avanzado',
  ARRAY[
    'Colócate frente a la barra con los pies a la altura de las caderas',
    'Flexiona las caderas y rodillas para agarrar la barra',
    'Mantén la espalda recta y levanta la barra',
    'Baja la barra controladamente'
  ],
  ARRAY['Erector espinal', 'Isquiotibiales', 'Glúteos', 'Trapecio'],
  ARRAY[
    'Mantén la espalda recta en todo momento',
    'Empuja desde los talones',
    'No redondees la espalda'
  ],
  '45-60 minutos',
  ARRAY['Barra', 'Discos'],
  'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
),

-- Hombros
(
  'Press Militar',
  'Hombros',
  'Ejercicio básico para desarrollar fuerza y tamaño en los hombros',
  'Intermedio',
  ARRAY[
    'De pie con los pies a la altura de los hombros',
    'Agarra la barra a la altura de los hombros',
    'Presiona la barra por encima de la cabeza',
    'Baja controladamente'
  ],
  ARRAY['Deltoides', 'Tríceps', 'Trapecio'],
  ARRAY[
    'Mantén el core activado',
    'No arquees la espalda',
    'Respira de manera controlada'
  ],
  '30-45 minutos',
  ARRAY['Barra', 'Discos'],
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80'
),

-- Piernas
(
  'Sentadillas',
  'Piernas',
  'El rey de los ejercicios para piernas',
  'Intermedio',
  ARRAY[
    'Coloca la barra en los trapecios',
    'Pies a la altura de los hombros',
    'Flexiona rodillas y caderas',
    'Empuja hacia arriba para volver a la posición inicial'
  ],
  ARRAY['Cuádriceps', 'Glúteos', 'Isquiotibiales', 'Core'],
  ARRAY[
    'Mantén el pecho arriba',
    'Las rodillas en línea con los pies',
    'Respira profundamente'
  ],
  '45-60 minutos',
  ARRAY['Barra', 'Discos', 'Rack de sentadillas'],
  'https://images.unsplash.com/photo-1534368420009-621bfab424a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
),

-- Bíceps
(
  'Curl de Bíceps con Barra',
  'Bíceps',
  'Ejercicio clásico para desarrollar los bíceps',
  'Principiante',
  ARRAY[
    'De pie con los pies a la altura de los hombros',
    'Agarra la barra con las palmas hacia arriba',
    'Flexiona los codos para levantar la barra',
    'Baja controladamente'
  ],
  ARRAY['Bíceps braquial', 'Braquial anterior'],
  ARRAY[
    'Mantén los codos pegados al cuerpo',
    'No uses impulso',
    'Contrae los bíceps en la parte superior'
  ],
  '30-40 minutos',
  ARRAY['Barra EZ', 'Discos'],
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
),

-- Tríceps
(
  'Extensiones de Tríceps en Polea',
  'Tríceps',
  'Excelente ejercicio para aislar los tríceps',
  'Principiante',
  ARRAY[
    'Agarra la cuerda de la polea alta',
    'Mantén los codos cerca del cuerpo',
    'Extiende los brazos hacia abajo',
    'Regresa controladamente'
  ],
  ARRAY['Tríceps', 'Ancóneo'],
  ARRAY[
    'Mantén los codos fijos',
    'No uses impulso',
    'Contrae los tríceps al final'
  ],
  '30-40 minutos',
  ARRAY['Máquina de poleas', 'Cuerda'],
  'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
),

-- Abdominales
(
  'Crunch',
  'Abdominales',
  'Ejercicio básico para fortalecer el core',
  'Principiante',
  ARRAY[
    'Acuéstate boca arriba con las rodillas flexionadas',
    'Coloca las manos detrás de la cabeza',
    'Eleva los hombros del suelo',
    'Baja controladamente'
  ],
  ARRAY['Recto abdominal', 'Oblicuos'],
  ARRAY[
    'No tires del cuello',
    'Mantén la zona lumbar en contacto con el suelo',
    'Exhala al subir'
  ],
  '20-30 minutos',
  ARRAY['Colchoneta'],
  'https://images.unsplash.com/photo-1544216717-3bbf52512659?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
),

-- Cardio
(
  'HIIT en Cinta',
  'Cardio',
  'Entrenamiento intervalado de alta intensidad para quemar grasa',
  'Intermedio',
  ARRAY[
    '5 minutos de calentamiento a ritmo suave',
    '30 segundos de sprint',
    '30 segundos de recuperación',
    'Repite 10-15 veces',
    '5 minutos de enfriamiento'
  ],
  ARRAY['Sistema cardiovascular', 'Cuádriceps', 'Isquiotibiales', 'Glúteos'],
  ARRAY[
    'Mantén una buena postura',
    'Ajusta la intensidad según tu nivel',
    'Mantente hidratado'
  ],
  '30-40 minutos',
  ARRAY['Cinta de correr'],
  'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
);