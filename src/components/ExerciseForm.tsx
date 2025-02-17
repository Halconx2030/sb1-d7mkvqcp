import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Search } from 'lucide-react';
import type { Exercise, MuscleGroup } from '../types';

interface ExerciseFormProps {
  onSubmit: (exercise: Omit<Exercise, 'id'>) => void;
}

const muscleGroups: MuscleGroup[] = [
  'Pecho', 'Espalda', 'Hombros', 'Bíceps', 
  'Tríceps', 'Piernas', 'Abdominales', 'Cardio'
];

// Base de datos de ejercicios predefinidos
const exerciseDatabase = [
  // Pecho
  {
    name: 'Press de Banca',
    muscleGroup: 'Pecho',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeight: 40
  },
  {
    name: 'Press Inclinado con Mancuernas',
    muscleGroup: 'Pecho',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 30
  },
  {
    name: 'Aperturas con Mancuernas',
    muscleGroup: 'Pecho',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 20
  },
  {
    name: 'Fondos en Paralelas',
    muscleGroup: 'Pecho',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 0
  },
  {
    name: 'Press Declinado',
    muscleGroup: 'Pecho',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 35
  },

  // Espalda
  {
    name: 'Dominadas',
    muscleGroup: 'Espalda',
    defaultSets: 3,
    defaultReps: 8,
    defaultWeight: 0
  },
  {
    name: 'Peso Muerto',
    muscleGroup: 'Espalda',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 80
  },
  {
    name: 'Remo con Barra',
    muscleGroup: 'Espalda',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeight: 50
  },
  {
    name: 'Remo en Máquina',
    muscleGroup: 'Espalda',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 45
  },
  {
    name: 'Jalón al Pecho',
    muscleGroup: 'Espalda',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeight: 45
  },

  // Hombros
  {
    name: 'Press Militar',
    muscleGroup: 'Hombros',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 30
  },
  {
    name: 'Elevaciones Laterales',
    muscleGroup: 'Hombros',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 10
  },
  {
    name: 'Press Arnold',
    muscleGroup: 'Hombros',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 20
  },
  {
    name: 'Elevaciones Frontales',
    muscleGroup: 'Hombros',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 10
  },
  {
    name: 'Remo al Mentón',
    muscleGroup: 'Hombros',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 25
  },

  // Bíceps
  {
    name: 'Curl de Bíceps con Barra',
    muscleGroup: 'Bíceps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 25
  },
  {
    name: 'Curl Martillo',
    muscleGroup: 'Bíceps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 16
  },
  {
    name: 'Curl de Concentración',
    muscleGroup: 'Bíceps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 12
  },
  {
    name: 'Curl en Banco Scott',
    muscleGroup: 'Bíceps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 20
  },
  {
    name: 'Curl 21s',
    muscleGroup: 'Bíceps',
    defaultSets: 3,
    defaultReps: 21,
    defaultWeight: 15
  },

  // Tríceps
  {
    name: 'Extensiones de Tríceps en Polea',
    muscleGroup: 'Tríceps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 25
  },
  {
    name: 'Press Francés',
    muscleGroup: 'Tríceps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 20
  },
  {
    name: 'Extensiones sobre la Cabeza',
    muscleGroup: 'Tríceps',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 15
  },
  {
    name: 'Fondos para Tríceps',
    muscleGroup: 'Tríceps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0
  },
  {
    name: 'Patada de Tríceps',
    muscleGroup: 'Tríceps',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 10
  },

  // Piernas
  {
    name: 'Sentadillas',
    muscleGroup: 'Piernas',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 60
  },
  {
    name: 'Prensa de Piernas',
    muscleGroup: 'Piernas',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeight: 100
  },
  {
    name: 'Extensiones de Cuádriceps',
    muscleGroup: 'Piernas',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 40
  },
  {
    name: 'Curl de Isquiotibiales',
    muscleGroup: 'Piernas',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 35
  },
  {
    name: 'Elevación de Pantorrillas',
    muscleGroup: 'Piernas',
    defaultSets: 4,
    defaultReps: 20,
    defaultWeight: 45
  },
  {
    name: 'Zancadas',
    muscleGroup: 'Piernas',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 30
  },

  // Abdominales
  {
    name: 'Crunch',
    muscleGroup: 'Abdominales',
    defaultSets: 3,
    defaultReps: 20,
    defaultWeight: 0
  },
  {
    name: 'Plancha',
    muscleGroup: 'Abdominales',
    defaultSets: 3,
    defaultReps: 60, // segundos
    defaultWeight: 0
  },
  {
    name: 'Elevación de Piernas',
    muscleGroup: 'Abdominales',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 0
  },
  {
    name: 'Russian Twist',
    muscleGroup: 'Abdominales',
    defaultSets: 3,
    defaultReps: 20,
    defaultWeight: 10
  },
  {
    name: 'Rueda Abdominal',
    muscleGroup: 'Abdominales',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0
  },

  // Cardio
  {
    name: 'Cinta de Correr',
    muscleGroup: 'Cardio',
    defaultSets: 1,
    defaultReps: 30, // minutos
    defaultWeight: 0
  },
  {
    name: 'Bicicleta Estática',
    muscleGroup: 'Cardio',
    defaultSets: 1,
    defaultReps: 30, // minutos
    defaultWeight: 0
  },
  {
    name: 'Elíptica',
    muscleGroup: 'Cardio',
    defaultSets: 1,
    defaultReps: 25, // minutos
    defaultWeight: 0
  },
  {
    name: 'Salto a la Cuerda',
    muscleGroup: 'Cardio',
    defaultSets: 3,
    defaultReps: 100, // saltos
    defaultWeight: 0
  },
  {
    name: 'HIIT',
    muscleGroup: 'Cardio',
    defaultSets: 8,
    defaultReps: 30, // segundos
    defaultWeight: 0
  }
];

export function ExerciseForm({ onSubmit }: ExerciseFormProps) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<typeof exerciseDatabase[0] | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filtrar sugerencias basadas en el término de búsqueda
  const suggestions = exerciseDatabase.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cerrar sugerencias cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExerciseSelect = (exercise: typeof exerciseDatabase[0]) => {
    setSelectedExercise(exercise);
    setSearchTerm(exercise.name);
    setShowSuggestions(false);

    // Actualizar los valores del formulario
    if (formRef.current) {
      const form = formRef.current;
      (form.elements.namedItem('muscleGroup') as HTMLSelectElement).value = exercise.muscleGroup;
      (form.elements.namedItem('sets') as HTMLInputElement).value = exercise.defaultSets.toString();
      (form.elements.namedItem('reps') as HTMLInputElement).value = exercise.defaultReps.toString();
      (form.elements.namedItem('weight') as HTMLInputElement).value = exercise.defaultWeight.toString();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    onSubmit({
      name: formData.get('name') as string,
      muscleGroup: formData.get('muscleGroup') as MuscleGroup,
      date: new Date().toISOString(),
      sets: Number(formData.get('sets')),
      reps: Number(formData.get('reps')),
      weight: Number(formData.get('weight')),
      photoUrl,
      notes: formData.get('notes') as string
    });

    e.currentTarget.reset();
    setPhotoUrl('');
    setSearchTerm('');
    setSelectedExercise(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Ejercicio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div ref={searchRef} className="relative">
          <label className="block text-sm font-medium text-gray-700">
            Nombre del Ejercicio
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value) {
                    setSelectedExercise(null);
                  }
                }}
                required
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Buscar ejercicio..."
              />
              
              {/* Lista de sugerencias */}
              {showSuggestions && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                  {suggestions.length > 0 ? (
                    suggestions.map((exercise) => (
                      <button
                        key={exercise.name}
                        type="button"
                        onClick={() => handleExerciseSelect(exercise)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50"
                      >
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-gray-500">{exercise.muscleGroup}</p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No se encontraron ejercicios
                    </div>
                  )}
                </div>
              )}
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Grupo Muscular
            <select
              name="muscleGroup"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {muscleGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Series
            <input
              type="number"
              name="sets"
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Repeticiones
            <input
              type="number"
              name="reps"
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Peso (kg)
            <input
              type="number"
              name="weight"
              min="0"
              step="0.5"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Foto
            <div className="mt-1 flex items-center">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Camera className="w-5 h-5 mr-2" />
                  Subir Foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
              </label>
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="ml-4 h-16 w-16 object-cover rounded-md"
                />
              )}
            </div>
          </label>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Notas
            <textarea
              name="notes"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Upload className="w-5 h-5 mr-2" />
        Registrar Ejercicio
      </button>
    </form>
  );
}