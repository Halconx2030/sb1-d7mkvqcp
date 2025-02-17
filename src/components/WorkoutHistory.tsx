import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Dumbbell } from 'lucide-react';
import type { Exercise } from '../types';

interface WorkoutHistoryProps {
  exercises: Exercise[];
}

export function WorkoutHistory({ exercises }: WorkoutHistoryProps) {
  const sortedExercises = [...exercises].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial de Ejercicios</h2>
      
      <div className="space-y-8">
        {sortedExercises.map((exercise) => (
          <div key={exercise.id} className="border-b pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(exercise.date), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Dumbbell className="w-4 h-4 mr-1" />
                  {exercise.muscleGroup}
                </p>
              </div>
              
              {exercise.photoUrl && (
                <img
                  src={exercise.photoUrl}
                  alt={exercise.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Series</p>
                <p className="mt-1 text-lg font-semibold">{exercise.sets}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Repeticiones</p>
                <p className="mt-1 text-lg font-semibold">{exercise.reps}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Peso</p>
                <p className="mt-1 text-lg font-semibold">{exercise.weight} kg</p>
              </div>
            </div>
            
            {exercise.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Notas</p>
                <p className="mt-1 text-sm text-gray-700">{exercise.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}