import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, Plus, Check, X, Edit2, Trash2, BarChart2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface PlannedWorkout {
  id: string;
  date: string;
  exercise_id: string;
  exercise: {
    name: string;
    muscle_group: string;
  };
  planned_sets: number;
  planned_reps: number;
  planned_weight: number;
  notes: string | null;
  completed: boolean;
}

interface WorkoutComparison {
  planned: PlannedWorkout;
  actual: {
    sets: number;
    reps: number;
    weight: number;
  } | null;
  completion_percentage: number;
}

export function WorkoutPlanner() {
  const [plannedWorkouts, setPlannedWorkouts] = useState<PlannedWorkout[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [comparisons, setComparisons] = useState<WorkoutComparison[]>([]);
  const [exercises, setExercises] = useState<Array<{ id: string; name: string; muscle_group: string }>>([]);

  useEffect(() => {
    loadPlannedWorkouts();
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, muscle_group');
      
      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error al cargar ejercicios:', error);
    }
  };

  const loadPlannedWorkouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      const { data, error } = await supabase
        .from('planned_workouts')
        .select(`
          *,
          exercise:exercises (
            name,
            muscle_group
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setPlannedWorkouts(data || []);
      
      // Cargar comparaciones
      await loadComparisons(data);
    } catch (error) {
      console.error('Error al cargar rutinas planificadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComparisons = async (planned: PlannedWorkout[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      const comparisonsData: WorkoutComparison[] = [];

      for (const workout of planned) {
        const { data: actualWorkout } = await supabase
          .from('user_workouts')
          .select('sets, reps, weight')
          .eq('user_id', user.id)
          .eq('exercise_id', workout.exercise_id)
          .eq('date', workout.date)
          .single();

        const completion = actualWorkout ? calculateCompletion(workout, actualWorkout) : 0;

        comparisonsData.push({
          planned: workout,
          actual: actualWorkout,
          completion_percentage: completion
        });
      }

      setComparisons(comparisonsData);
    } catch (error) {
      console.error('Error al cargar comparaciones:', error);
    }
  };

  const calculateCompletion = (planned: PlannedWorkout, actual: any) => {
    const setsCompletion = (actual.sets / planned.planned_sets) * 100;
    const repsCompletion = (actual.reps / planned.planned_reps) * 100;
    const weightCompletion = (actual.weight / planned.planned_weight) * 100;

    return Math.round((setsCompletion + repsCompletion + weightCompletion) / 3);
  };

  const handleAddWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      const newWorkout = {
        user_id: user.id,
        date: selectedDate.toISOString().split('T')[0],
        exercise_id: exercises[0].id,
        planned_sets: 3,
        planned_reps: 12,
        planned_weight: 0,
        notes: ''
      };

      const { data, error } = await supabase
        .from('planned_workouts')
        .insert([newWorkout])
        .select(`
          *,
          exercise:exercises (
            name,
            muscle_group
          )
        `)
        .single();

      if (error) throw error;

      setPlannedWorkouts([...plannedWorkouts, data]);
      setEditing(data.id);
    } catch (error) {
      console.error('Error al agregar rutina:', error);
    }
  };

  const handleUpdateWorkout = async (id: string, updates: Partial<PlannedWorkout>) => {
    try {
      const { error } = await supabase
        .from('planned_workouts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setPlannedWorkouts(plannedWorkouts.map(workout =>
        workout.id === id ? { ...workout, ...updates } : workout
      ));
      setEditing(null);
    } catch (error) {
      console.error('Error al actualizar rutina:', error);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      const { error } = await supabase
        .from('planned_workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlannedWorkouts(plannedWorkouts.filter(workout => workout.id !== id));
    } catch (error) {
      console.error('Error al eliminar rutina:', error);
    }
  };

  // Generar días de la semana
  const weekStart = startOfWeek(selectedDate);
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <CalendarIcon className="w-6 h-6 mr-2" />
          Planificador de Rutinas
        </h2>
      </div>

      <div className="p-6">
        {/* Calendario Semanal */}
        <div className="mb-8">
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day) => (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`p-4 rounded-lg text-center transition-colors ${
                  isSameDay(day, selectedDate)
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                <p className="text-sm font-medium">
                  {format(day, 'EEE', { locale: es })}
                </p>
                <p className="text-lg">
                  {format(day, 'd')}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Ejercicios Planificados */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">
              Ejercicios para {format(selectedDate, "d 'de' MMMM", { locale: es })}
            </h3>
            <button
              onClick={handleAddWorkout}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Ejercicio
            </button>
          </div>

          {plannedWorkouts
            .filter(workout => isSameDay(new Date(workout.date), selectedDate))
            .map((workout) => (
              <div
                key={workout.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {editing === workout.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ejercicio
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={workout.exercise_id}
                            onChange={(e) => handleUpdateWorkout(workout.id, {
                              exercise_id: e.target.value
                            })}
                          >
                            {exercises.map((exercise) => (
                              <option key={exercise.id} value={exercise.id}>
                                {exercise.name} ({exercise.muscle_group})
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Series
                          <input
                            type="number"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={workout.planned_sets}
                            onChange={(e) => handleUpdateWorkout(workout.id, {
                              planned_sets: parseInt(e.target.value)
                            })}
                          />
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Repeticiones
                          <input
                            type="number"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={workout.planned_reps}
                            onChange={(e) => handleUpdateWorkout(workout.id, {
                              planned_reps: parseInt(e.target.value)
                            })}
                          />
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Peso (kg)
                          <input
                            type="number"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={workout.planned_weight}
                            onChange={(e) => handleUpdateWorkout(workout.id, {
                              planned_weight: parseFloat(e.target.value)
                            })}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notas
                        <textarea
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={workout.notes || ''}
                          onChange={(e) => handleUpdateWorkout(workout.id, {
                            notes: e.target.value
                          })}
                        />
                      </label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditing(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {workout.exercise.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {workout.exercise.muscle_group}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditing(workout.id)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Series</p>
                        <p className="mt-1 text-lg font-semibold">{workout.planned_sets}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Repeticiones</p>
                        <p className="mt-1 text-lg font-semibold">{workout.planned_reps}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Peso</p>
                        <p className="mt-1 text-lg font-semibold">{workout.planned_weight} kg</p>
                      </div>
                    </div>

                    {workout.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">Notas</p>
                        <p className="mt-1 text-sm text-gray-700">{workout.notes}</p>
                      </div>
                    )}

                    {/* Comparación con el entrenamiento real */}
                    {comparisons.find(c => c.planned.id === workout.id)?.actual && (
                      <div className="mt-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-700 flex items-center">
                            <BarChart2 className="w-4 h-4 mr-1" />
                            Comparación con lo realizado
                          </h5>
                          <div className="flex items-center">
                            <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{
                                  width: `${comparisons.find(c => c.planned.id === workout.id)?.completion_percentage}%`
                                }}
                              />
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {comparisons.find(c => c.planned.id === workout.id)?.completion_percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

          {plannedWorkouts.filter(workout => 
            isSameDay(new Date(workout.date), selectedDate)
          ).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay ejercicios planificados para este día.
              <br />
              <button
                onClick={handleAddWorkout}
                className="mt-2 text-blue-600 hover:text-blue-500"
              >
                Agregar ejercicio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}