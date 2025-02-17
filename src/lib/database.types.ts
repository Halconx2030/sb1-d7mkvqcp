export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string
          name: string
          muscle_group: string
          description: string
          difficulty: string
          instructions: string[]
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          muscle_group: string
          description: string
          difficulty: string
          instructions: string[]
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          muscle_group?: string
          description?: string
          difficulty?: string
          instructions?: string[]
          image_url?: string | null
          created_at?: string
        }
      }
      user_workouts: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          date: string
          sets: number
          reps: number
          weight: number
          notes: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          date?: string
          sets: number
          reps: number
          weight: number
          notes?: string | null
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          date?: string
          sets?: number
          reps?: number
          weight?: number
          notes?: string | null
          photo_url?: string | null
          created_at?: string
        }
      }
    }
  }
}