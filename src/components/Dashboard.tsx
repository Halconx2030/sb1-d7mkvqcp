import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Award, TrendingUp, Clock, Target } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import type { MuscleGroup } from '../types';

interface WorkoutHistory {
  date: string;
  muscle: string;
  exercises: number;
  details: Array<{
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }>;
}

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

interface Achievement {
  id: string;
  title: string;
  description: string;
  achieved_at: string;
}

interface DashboardProps {
  onNavigate: (tab: string, muscleGroup?: MuscleGroup) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutHistory | null>(null);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState(0);
  const [nextWorkout, setNextWorkout] = useState<{
    date: Date;
    muscle: string;
  } | null>(null);
  const [monthlyStats, setMonthlyStats] = useState({
    totalWorkouts: 0,
    totalWeight: 0,
    totalTime: 0,
    caloriesBurned: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          loadWorkoutHistory(),
          loadUserGoals(),
          loadAchievements(),
          calculateStreak(),
          loadNextWorkout(),
          calculateMonthlyStats()
        ]);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setError('Error al cargar los datos. Por favor, intenta recargar la página.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadWorkoutHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      const { data, error } = await supabase
        .from('user_workouts')
        .select(`
          id,
          date,
          exercise:exercises (
            name,
            muscle_group
          ),
          sets,
          reps,
          weight
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(15);

      if (error) throw error;

      if (!data || data.length === 0) {
        setWorkoutHistory([]);
        return;
      }

      // Agrupar ejercicios por fecha
      const groupedWorkouts = data.reduce((acc: { [key: string]: WorkoutHistory }, workout) => {
        const date = workout.date.split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            muscle: workout.exercise.muscle_group,
            exercises: 0,
            details: []
          };
        }
        acc[date].exercises++;
        acc[date].details.push({
          name: workout.exercise.name,
          sets: workout.sets,
          reps: workout.reps,
          weight: workout.weight
        });
        return acc;
      }, {});

      setWorkoutHistory(Object.values(groupedWorkouts).slice(0, 3));
    } catch (error) {
      console.error('Error al cargar historial:', error);
      throw error;
    }
  };

  const loadUserGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('deadline', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error al cargar metas:', error);
      throw error;
    }
  };

  const loadAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error al cargar logros:', error);
      throw error;
    }
  };

  const calculateStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      const { data, error } = await supabase
        .from('user_workouts')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setStreak(0);
        return;
      }

      let currentStreak = 0;
      let currentDate = new Date();
      let lastWorkoutDate = new Date(data[0].date);

      // Si el último entrenamiento no fue hoy o ayer, la racha se rompe
      if (Math.abs(currentDate.getTime() - lastWorkoutDate.getTime()) > 2 * 24 * 60 * 60 * 1000) {
        setStreak(0);
        return;
      }

      // Calcular racha
      for (let i = 0; i < data.length - 1; i++) {
        const date1 = new Date(data[i].date);
        const date2 = new Date(data[i + 1].date);
        const diffDays = Math.floor((date1.getTime() - date2.getTime()) / (24 * 60 * 60 * 1000));

        if (diffDays <= 1) {
          currentStreak++;
        } else {
          break;
        }
      }

      setStreak(currentStreak + 1);
    } catch (error) {
      console.error('Error al calcular racha:', error);
      throw error;
    }
  };

  const loadNextWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      const { data, error } = await supabase
        .from('planned_workouts')
        .select(`
          date,
          exercise:exercises (
            muscle_group
          )
        `)
        .eq('user_id', user.id)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setNextWorkout({
          date: new Date(data[0].date),
          muscle: data[0].exercise.muscle_group
        });
      } else {
        // Si no hay entrenamiento planificado, sugerir uno para mañana
        setNextWorkout({
          date: addDays(new Date(), 1),
          muscle: 'Pecho'
        });
      }
    } catch (error) {
      console.error('Error al cargar próximo entrenamiento:', error);
      throw error;
    }
  };

  const calculateMonthlyStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('user_workouts')
        .select(`
          date,
          sets,
          reps,
          weight
        `)
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString());

      if (error) throw error;

      if (!data || data.length === 0) {
        setMonthlyStats({
          totalWorkouts: 0,
          totalWeight: 0,
          totalTime: 0,
          caloriesBurned: 0
        });
        return;
      }

      const stats = data.reduce((acc, workout) => {
        acc.totalWorkouts++;
        acc.totalWeight += workout.weight * workout.sets * workout.reps;
        // Estimación simple de tiempo y calorías
        const timePerWorkout = 45; // minutos
        const caloriesPerWorkout = 300;
        acc.totalTime += timePerWorkout;
        acc.caloriesBurned += caloriesPerWorkout;
        return acc;
      }, {
        totalWorkouts: 0,
        totalWeight: 0,
        totalTime: 0,
        caloriesBurned: 0
      });

      setMonthlyStats(stats);
    } catch (error) {
      console.error('Error al calcular estadísticas mensuales:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bienvenida y Resumen */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">¡Bienvenido de nuevo!</h2>
        <p className="text-gray-600 mb-6">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('planner')}
            className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Próximo Entrenamiento</h3>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            {nextWorkout && (
              <p className="text-sm text-gray-600">
                {format(nextWorkout.date, "d 'de' MMMM", { locale: es })} - {nextWorkout.muscle}
              </p>
            )}
          </button>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Racha Actual</h3>
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600">{streak} días consecutivos</p>
          </div>
          
          <button
            onClick={() => onNavigate('achievements')}
            className="bg-purple-50 rounded-lg p-4 hover:bg-purple-100 transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Logros</h3>
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm text-gray-600">
              {achievements.length} nuevos esta semana
            </p>
          </button>
        </div>
      </div>

      {/* Progreso Reciente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Últimos Entrenamientos</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {workoutHistory.map((workout) => (
              <button
                key={workout.date}
                onClick={() => setSelectedWorkout(workout)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-left">{workout.muscle}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(workout.date), 'd MMM', { locale: es })}
                  </p>
                </div>
                <p className="text-sm text-gray-600">{workout.exercises} ejercicios</p>
              </button>
            ))}

            {workoutHistory.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No hay entrenamientos registrados.
                <br />
                <button
                  onClick={() => onNavigate('form')}
                  className="mt-2 text-blue-600 hover:text-blue-500"
                >
                  Registrar primer entrenamiento
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Metas en Progreso</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => onNavigate('goals')}
                className="w-full text-left hover:bg-gray-50 p-3 rounded-lg transition-colors"
              >
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{goal.title}</span>
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
                {goal.deadline && (
                  <p className="text-xs text-gray-500 mt-1">
                    Meta para: {format(new Date(goal.deadline), 'd MMM, yyyy', { locale: es })}
                  </p>
                )}
              </button>
            ))}

            {goals.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No hay metas establecidas.
                <br />
                <button
                  onClick={() => onNavigate('goals')}
                  className="mt-2 text-blue-600 hover:text-blue-500"
                >
                  Establecer metas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Estadísticas del Mes</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Entrenamientos</p>
            <p className="text-2xl font-bold">{monthlyStats.totalWorkouts}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Peso Total Levantado</p>
            <p className="text-2xl font-bold">{Math.round(monthlyStats.totalWeight)} kg</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Tiempo Total</p>
            <p className="text-2xl font-bold">{(monthlyStats.totalTime / 60).toFixed(1)} hrs</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Calorías Quemadas</p>
            <p className="text-2xl font-bold">{monthlyStats.caloriesBurned}</p>
          </div>
        </div>
      </div>

      {/* Modal de detalles del entrenamiento */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Detalles del Entrenamiento - {format(new Date(selectedWorkout.date), 'd MMM, yyyy', { locale: es })}
              </h3>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedWorkout.details.map((exercise, index) => (
                <div key={index} className="border-b pb-4">
                  <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Series</p>
                      <p className="font-semibold">{exercise.sets}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Repeticiones</p>
                      <p className="font-semibold">{exercise.reps}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Peso</p>
                      <p className="font-semibold">{exercise.weight} kg</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}