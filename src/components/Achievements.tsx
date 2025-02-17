import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Award, Trophy, Star, Target, Calendar, TrendingUp, Medal } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Achievement {
  id: string;
  title: string;
  description: string;
  badge_url: string;
  achieved_at: string;
}

interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalWorkouts: number;
  achievementsCount: number;
  nextGoal: {
    title: string;
    progress: number;
    total: number;
  } | null;
}

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    totalWorkouts: 0,
    achievementsCount: 0,
    nextGoal: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAchievements(),
        loadUserStats(),
        checkAndCreateAchievements()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
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
        .order('achieved_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error al cargar logros:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      // Cargar entrenamientos totales
      const { data: workouts, error: workoutsError } = await supabase
        .from('user_workouts')
        .select('id, date')
        .eq('user_id', user.id);

      if (workoutsError) throw workoutsError;

      // Cargar próxima meta
      const { data: goals, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('deadline', { ascending: true })
        .limit(1)
        .single();

      if (goalsError && goalsError.code !== 'PGRST116') throw goalsError;

      // Calcular nivel y XP basado en entrenamientos y logros
      const totalWorkouts = workouts?.length || 0;
      const xpPerWorkout = 100;
      const xpPerAchievement = 500;
      const totalXP = (totalWorkouts * xpPerWorkout) + (achievements.length * xpPerAchievement);
      const level = Math.floor(totalXP / 1000) + 1;
      const xpInCurrentLevel = totalXP % 1000;

      setUserStats({
        level,
        xp: xpInCurrentLevel,
        xpToNextLevel: 1000,
        totalWorkouts,
        achievementsCount: achievements.length,
        nextGoal: goals ? {
          title: goals.title,
          progress: goals.current_value,
          total: goals.target_value
        } : null
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const checkAndCreateAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      // Obtener datos necesarios para verificar logros
      const { data: workouts } = await supabase
        .from('user_workouts')
        .select('id, date, weight')
        .eq('user_id', user.id);

      if (!workouts) return;

      const newAchievements = [];

      // Logro: Primer entrenamiento
      if (workouts.length === 1) {
        newAchievements.push({
          user_id: user.id,
          title: 'Primer Entrenamiento',
          description: '¡Completaste tu primer entrenamiento!',
          badge_url: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=300',
          achieved_at: new Date().toISOString()
        });
      }

      // Logro: 10 entrenamientos
      if (workouts.length === 10) {
        newAchievements.push({
          user_id: user.id,
          title: 'Dedicación Inicial',
          description: '¡Completaste 10 entrenamientos!',
          badge_url: 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=300',
          achieved_at: new Date().toISOString()
        });
      }

      // Logro: 100kg total levantado
      const totalWeight = workouts.reduce((sum, w) => sum + (w.weight || 0), 0);
      if (totalWeight >= 100 && !achievements.some(a => a.title === 'Fuerza Emergente')) {
        newAchievements.push({
          user_id: user.id,
          title: 'Fuerza Emergente',
          description: '¡Levantaste más de 100kg en total!',
          badge_url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=300',
          achieved_at: new Date().toISOString()
        });
      }

      // Insertar nuevos logros
      if (newAchievements.length > 0) {
        const { error } = await supabase
          .from('achievements')
          .insert(newAchievements);

        if (error) throw error;
        
        // Recargar logros
        await loadAchievements();
      }
    } catch (error) {
      console.error('Error al verificar logros:', error);
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Trophy className="w-6 h-6 mr-2" />
          Logros y Medallas
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Nivel Actual */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nivel Actual</h3>
              <Star className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold mb-2">Nivel {userStats.level}</p>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-2">
              <div
                className="bg-white rounded-full h-2"
                style={{ width: `${(userStats.xp / userStats.xpToNextLevel) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm">
              {userStats.xp}/{userStats.xpToNextLevel} XP para el siguiente nivel
            </p>
          </div>

          {/* Total Logros */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Logros</h3>
              <Award className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold">{userStats.achievementsCount}</p>
            <p className="text-sm mt-2">Logros desbloqueados</p>
            <p className="text-sm mt-1">
              {Math.max(0, 20 - userStats.achievementsCount)} logros por descubrir
            </p>
          </div>

          {/* Próximo Logro */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Próximo Objetivo</h3>
              <Target className="w-6 h-6" />
            </div>
            {userStats.nextGoal ? (
              <>
                <p className="text-lg font-semibold mb-2">{userStats.nextGoal.title}</p>
                <p className="text-sm">
                  {userStats.nextGoal.progress}/{userStats.nextGoal.total} completado
                </p>
              </>
            ) : (
              <p className="text-lg">¡Establece nuevas metas!</p>
            )}
          </div>
        </div>

        {/* Logros Recientes */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Logros Recientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {achievement.badge_url ? (
                      <img
                        src={achievement.badge_url}
                        alt={achievement.title}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <Medal className="w-12 h-12 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(achievement.achieved_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {achievements.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No has desbloqueado ningún logro aún.
                <br />
                ¡Comienza a entrenar para conseguir tus primeros logros!
              </div>
            )}
          </div>
        </div>

        {/* Próximos Desafíos */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Próximos Desafíos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Guerrero del Gimnasio</h4>
                <Trophy className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Completa 20 entrenamientos en un mes
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{
                    width: `${Math.min(100, (userStats.totalWorkouts / 20) * 100)}%`
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {userStats.totalWorkouts}/20 entrenamientos
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Maestro de la Constancia</h4>
                <Trophy className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Alcanza el nivel 10
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{ width: `${(userStats.level / 10) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Nivel {userStats.level}/10
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Coleccionista</h4>
                <Trophy className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Desbloquea 10 logros diferentes
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{
                    width: `${(userStats.achievementsCount / 10) * 100}%`
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {userStats.achievementsCount}/10 logros
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}