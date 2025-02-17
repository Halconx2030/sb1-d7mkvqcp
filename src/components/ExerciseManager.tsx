import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Settings, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import type { MuscleGroup } from '../types';

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

export function ExerciseManager() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Exercise>>({});

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error al cargar ejercicios:', error);
      setError('Error al cargar los ejercicios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!formData.name || !formData.muscle_group) {
        throw new Error('El nombre y grupo muscular son obligatorios');
      }

      if (editing) {
        const { error } = await supabase
          .from('exercises')
          .update(formData)
          .eq('id', editing);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('exercises')
          .insert([formData]);

        if (error) throw error;
      }

      await loadExercises();
      setEditing(null);
      setFormData({});
    } catch (error) {
      console.error('Error al guardar ejercicio:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar el ejercicio');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadExercises();
    } catch (error) {
      console.error('Error al eliminar ejercicio:', error);
      setError('Error al eliminar el ejercicio');
    }
  };

  const muscleGroups: MuscleGroup[] = [
    'Pecho', 'Espalda', 'Hombros', 'Bíceps', 
    'Tríceps', 'Piernas', 'Abdominales', 'Cardio'
  ];

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
          <Settings className="w-6 h-6 mr-2" />
          Gestión de Ejercicios
        </h2>
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          {error}
        </div>
      )}

      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Administra los ejercicios disponibles en la aplicación
          </p>
          <button
            onClick={() => {
              setEditing('new');
              setFormData({});
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Ejercicio
          </button>
        </div>

        {editing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editing === 'new' ? 'Nuevo Ejercicio' : 'Editar Ejercicio'}
                </h3>
                <button
                  onClick={() => {
                    setEditing(null);
                    setFormData({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Grupo Muscular
                      <select
                        value={formData.muscle_group || ''}
                        onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Seleccionar grupo</option>
                        {muscleGroups.map((group) => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Dificultad
                      <select
                        value={formData.difficulty || ''}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Exercise['difficulty'] })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Seleccionar dificultad</option>
                        <option value="Principiante">Principiante</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Duración
                      <input
                        type="text"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Ej: 30-45 minutos"
                        required
                      />
                    </label>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      URL de la Imagen
                      <input
                        type="url"
                        value={formData.image_url || ''}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </label>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Instrucciones (una por línea)
                      <textarea
                        value={formData.instructions?.join('\n') || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          instructions: e.target.value.split('\n').filter(Boolean)
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={4}
                        required
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Músculos Trabajados (uno por línea)
                      <textarea
                        value={formData.muscles?.join('\n') || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          muscles: e.target.value.split('\n').filter(Boolean)
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Consejos (uno por línea)
                      <textarea
                        value={formData.tips?.join('\n') || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          tips: e.target.value.split('\n').filter(Boolean)
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </label>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Equipo Necesario (uno por línea)
                      <textarea
                        value={formData.equipment?.join('\n') || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          equipment: e.target.value.split('\n').filter(Boolean)
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setFormData({});
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 inline-block mr-2" />
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video relative">
                <img
                  src={exercise.image_url}
                  alt={exercise.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                    <p className="text-sm text-gray-500">{exercise.muscle_group}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    exercise.difficulty === 'Principiante' ? 'bg-green-100 text-green-800' :
                    exercise.difficulty === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {exercise.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {exercise.description}
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setEditing(exercise.id);
                      setFormData(exercise);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}