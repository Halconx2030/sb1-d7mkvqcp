import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Info, ArrowRight } from 'lucide-react';
import type { Exercise, MuscleGroup } from '../types';

interface WorkoutStatsProps {
  exercises: Exercise[];
  onNavigate: (tab: string, muscleGroup?: MuscleGroup) => void;
}

export function WorkoutStats({ exercises, onNavigate }: WorkoutStatsProps) {
  const muscleGroupData = exercises.reduce((acc, exercise) => {
    const group = acc.find(g => g.name === exercise.muscleGroup);
    if (group) {
      group.count += 1;
      group.totalWeight += exercise.weight * exercise.sets * exercise.reps;
    } else {
      acc.push({
        name: exercise.muscleGroup,
        count: 1,
        totalWeight: exercise.weight * exercise.sets * exercise.reps
      });
    }
    return acc;
  }, [] as Array<{ name: string; count: number; totalWeight: number }>);

  const getMuscleGroupSuggestions = (): Array<{
    group: MuscleGroup;
    reason: string;
    description: string;
  }> => {
    const muscleGroups: MuscleGroup[] = [
      'Pecho', 'Espalda', 'Hombros', 'Bíceps', 
      'Tríceps', 'Piernas', 'Abdominales', 'Cardio'
    ];
    
    const workoutCounts = new Map(muscleGroupData.map(g => [g.name, g.count]));
    const suggestions: Array<{
      group: MuscleGroup;
      reason: string;
      description: string;
    }> = [];

    // Encontrar grupos musculares no trabajados
    const unworkedGroups = muscleGroups.filter(group => !workoutCounts.has(group));
    for (const group of unworkedGroups) {
      suggestions.push({
        group,
        reason: 'Grupo muscular no trabajado',
        description: `No has realizado ejercicios para ${group.toLowerCase()}. Es importante mantener un entrenamiento equilibrado para un desarrollo muscular completo.`
      });
    }

    // Encontrar grupos menos trabajados
    const sortedGroups = [...workoutCounts.entries()]
      .sort(([, a], [, b]) => a - b)
      .map(([name]) => name as MuscleGroup);

    for (const group of sortedGroups.slice(0, 2)) {
      if (suggestions.length < 3) {
        suggestions.push({
          group,
          reason: 'Grupo muscular poco trabajado',
          description: `Has entrenado ${group.toLowerCase()} solo ${workoutCounts.get(group)} veces. Aumentar la frecuencia de entrenamiento de este grupo muscular puede mejorar tus resultados.`
        });
      }
    }

    // Asegurar balance entre grupos complementarios
    const complementaryPairs = [
      ['Pecho', 'Espalda'],
      ['Bíceps', 'Tríceps'],
      ['Hombros', 'Tríceps']
    ];

    for (const [muscle1, muscle2] of complementaryPairs) {
      const count1 = workoutCounts.get(muscle1) || 0;
      const count2 = workoutCounts.get(muscle2) || 0;
      if (Math.abs(count1 - count2) > 2 && suggestions.length < 3) {
        const lessWorked = count1 < count2 ? muscle1 : muscle2;
        suggestions.push({
          group: lessWorked as MuscleGroup,
          reason: 'Desbalance muscular',
          description: `Hay un desbalance entre ${muscle1.toLowerCase()} y ${muscle2.toLowerCase()}. Equilibrar el entrenamiento de estos grupos musculares es importante para prevenir lesiones y mantener una postura correcta.`
        });
      }
    }

    return suggestions.slice(0, 3);
  };

  const suggestions = getMuscleGroupSuggestions();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Estadísticas de Entrenamiento</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Grupos Musculares Trabajados
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={muscleGroupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Sugerencias para Próximo Entrenamiento
        </h3>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">
                    Entrenar {suggestion.group}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {suggestion.description}
                  </p>
                  <button
                    onClick={() => onNavigate('guide', suggestion.group)}
                    className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    Ver ejercicios recomendados
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {suggestions.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              ¡Buen trabajo! Tu entrenamiento está bien balanceado.
              <br />
              Continúa con tu rutina actual.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}