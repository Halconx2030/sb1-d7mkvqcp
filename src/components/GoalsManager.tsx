import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Target, Plus, Edit2, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserGoal {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
  completed: boolean;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export function GoalsManager() {
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadGoals = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error al cargar metas:', error);
      showNotification('error', 'Error al cargar las metas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleAddGoal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      const newGoalData = {
        user_id: user.id,
        title: 'Nueva Meta',
        description: '',
        target_value: 0,
        current_value: 0,
        unit: 'kg',
        deadline: new Date().toISOString().split('T')[0],
        completed: false
      };

      const { data, error } = await supabase
        .from('user_goals')
        .insert([newGoalData])
        .select()
        .single();

      if (error) throw error;

      setGoals(prevGoals => [...prevGoals, data]);
      setEditing(data.id);
      setNewGoal(true);
      showNotification('success', 'Meta creada correctamente');
    } catch (error) {
      console.error('Error al agregar meta:', error);
      showNotification('error', 'Error al crear la meta');
    }
  };

  const handleUpdateGoal = async (id: string, updates: Partial<UserGoal>) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === id ? { ...goal, ...updates } : goal
        )
      );
    } catch (error) {
      console.error('Error al actualizar meta:', error);
      showNotification('error', 'Error al actualizar la meta');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (deleting) return;
    
    try {
      setDeleting(id);
      
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
      
      if (editing === id) {
        setEditing(null);
        setNewGoal(false);
      }

      showNotification('success', 'Meta eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar meta:', error);
      showNotification('error', 'Error al eliminar la meta');
      await loadGoals();
    } finally {
      setDeleting(null);
    }
  };

  const handleCancelEdit = async (goal: UserGoal) => {
    if (newGoal) {
      await handleDeleteGoal(goal.id);
    }
    setEditing(null);
    setNewGoal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      {notification && (
        <div
          className={`absolute top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {notification.type === 'error' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Target className="w-6 h-6 mr-2" />
          Metas y Objetivos
        </h2>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Establece y realiza seguimiento de tus objetivos de fitness
          </p>
          <button
            onClick={handleAddGoal}
            disabled={deleting !== null}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Meta
          </button>
        </div>

        <div className="space-y-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                deleting === goal.id ? 'opacity-50' : ''
              }`}
            >
              {editing === goal.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Título
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={goal.title}
                          onChange={(e) => handleUpdateGoal(goal.id, {
                            title: e.target.value
                          })}
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha Límite
                        <input
                          type="date"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={goal.deadline.split('T')[0]}
                          onChange={(e) => handleUpdateGoal(goal.id, {
                            deadline: new Date(e.target.value).toISOString()
                          })}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                      <textarea
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={goal.description}
                        onChange={(e) => handleUpdateGoal(goal.id, {
                          description: e.target.value
                        })}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Valor Objetivo
                        <input
                          type="number"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={goal.target_value}
                          onChange={(e) => handleUpdateGoal(goal.id, {
                            target_value: parseFloat(e.target.value)
                          })}
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Valor Actual
                        <input
                          type="number"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={goal.current_value}
                          onChange={(e) => handleUpdateGoal(goal.id, {
                            current_value: parseFloat(e.target.value)
                          })}
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Unidad
                        <select
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={goal.unit}
                          onChange={(e) => handleUpdateGoal(goal.id, {
                            unit: e.target.value
                          })}
                        >
                          <option value="kg">Kilogramos (kg)</option>
                          <option value="lbs">Libras (lbs)</option>
                          <option value="cm">Centímetros (cm)</option>
                          <option value="%">Porcentaje (%)</option>
                          <option value="días">Días</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleCancelEdit(goal)}
                      disabled={deleting !== null}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        setEditing(null);
                        setNewGoal(false);
                      }}
                      disabled={deleting !== null}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {goal.title || 'Nueva Meta'}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Fecha límite: {format(new Date(goal.deadline), "d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditing(goal.id)}
                        disabled={deleting !== null}
                        className="p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        disabled={deleting !== null}
                        className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-gray-600 mb-4">{goal.description}</p>
                  )}

                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Progreso</span>
                      <span className="text-sm text-gray-500">
                        {goal.current_value}/{goal.target_value} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (goal.current_value / goal.target_value) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {goals.length === 0 && !newGoal && (
            <div className="text-center py-8 text-gray-500">
              No hay metas establecidas.
              <br />
              <button
                onClick={handleAddGoal}
                disabled={deleting !== null}
                className="mt-2 text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear primera meta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}