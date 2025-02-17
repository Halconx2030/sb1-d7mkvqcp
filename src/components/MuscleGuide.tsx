import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { MuscleGroup } from '../types';
import { ChevronRight, Search, Filter, Dumbbell, Clock, Target } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  description: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  instructions: string[];
  muscles: string[];
  tips: string[];
  duration: string;
  equipment: string[];
  image_url: string;
}

interface MuscleGuideProps {
  initialMuscleGroup?: MuscleGroup | null;
}

export function MuscleGuide({ initialMuscleGroup }: MuscleGuideProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(initialMuscleGroup || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Exercise['difficulty'] | 'Todos'>('Todos');

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (initialMuscleGroup) {
      setSelectedMuscle(initialMuscleGroup);
    }
  }, [initialMuscleGroup]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*');

      if (error) throw error;
      setExercises(data || []);
    } catch (err) {
      console.error('Error al cargar ejercicios:', err);
      setError('Error al cargar los ejercicios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const muscleGroups = Array.from(new Set(exercises.map(ex => ex.muscle_group)));

  const filteredExercises = selectedMuscle
    ? exercises.filter(exercise => 
        exercise.muscle_group === selectedMuscle &&
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedDifficulty === 'Todos' || exercise.difficulty === selectedDifficulty)
      )
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900">Guía de Ejercicios</h2>
        <p className="mt-2 text-gray-600">
          Explora nuestra biblioteca completa de ejercicios con instrucciones detalladas y consejos profesionales.
        </p>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar ejercicios..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            className="border rounded-md py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
          >
            <option value="Todos">Todos los niveles</option>
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-[300px,1fr]">
        {/* Lista de grupos musculares */}
        <div className="border-r">
          <div className="p-4">
            <h3 className="font-semibold text-gray-700 mb-4">Grupos Musculares</h3>
            <div className="space-y-2">
              {muscleGroups.map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => setSelectedMuscle(muscle as MuscleGroup)}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center justify-between ${
                    selectedMuscle === muscle
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{muscle}</span>
                  <ChevronRight className={`w-5 h-5 ${
                    selectedMuscle === muscle ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de ejercicios */}
        <div className="p-6">
          {selectedMuscle ? (
            <>
              <h3 className="text-xl font-semibold mb-6">
                Ejercicios para {selectedMuscle}
              </h3>
              <div className="space-y-8">
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={exercise.image_url}
                          alt={exercise.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold">{exercise.name}</h4>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{exercise.duration}</span>
                            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                              exercise.difficulty === 'Principiante' ? 'bg-green-100 text-green-800' :
                              exercise.difficulty === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {exercise.difficulty}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{exercise.description}</p>
                        
                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Músculos trabajados:</h5>
                          <div className="flex flex-wrap gap-2">
                            {exercise.muscles.map((muscle) => (
                              <span key={muscle} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm">
                                {muscle}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Equipo necesario:</h5>
                          <div className="flex flex-wrap gap-2">
                            {exercise.equipment.map((item) => (
                              <span key={item} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                                <Dumbbell className="w-4 h-4 inline-block mr-1" />
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Instrucciones:</h5>
                          <ol className="list-decimal list-inside space-y-2">
                            {exercise.instructions.map((instruction, index) => (
                              <li key={index} className="text-gray-600">
                                {instruction}
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Consejos:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {exercise.tips.map((tip, index) => (
                              <li key={index} className="text-gray-600">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron ejercicios que coincidan con los filtros seleccionados.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Selecciona un grupo muscular para ver los ejercicios disponibles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}