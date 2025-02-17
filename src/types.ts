export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  date: string;
  sets: number;
  reps: number;
  weight: number;
  photoUrl: string;
  notes?: string;
}

export interface WorkoutHistory {
  date: string;
  exercises: Exercise[];
}

export type MuscleGroup = 
  | 'Pecho'
  | 'Espalda'
  | 'Hombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Piernas'
  | 'Abdominales'
  | 'Cardio';