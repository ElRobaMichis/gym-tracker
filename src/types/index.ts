export type ProgressionType = 'double' | 'triple';

export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'compound';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  progressionType: ProgressionType;
  weightIncrement: number;
  weightIncrementUnit?: 'kg' | 'lb'; // Unit the increment was set in (for conversion)
  targetRepMin: number;
  targetRepMax: number;
  targetSetsMin: number;
  targetSetsMax: number;
  isDefault: boolean;
  userId?: string;
  createdAt: string;
}

export interface WorkoutSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  weight: number;
  weightUnit?: 'kg' | 'lb'; // Unit the weight was entered in (for conversion)
  reps: number;
  isWarmup: boolean;
  rpe?: number;
  completed: boolean;
  createdAt: string;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  orderIndex: number;
  notes?: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  userId?: string;
  name: string;
  date: string;
  duration?: number;
  notes?: string;
  completed: boolean;
  exercises: WorkoutExercise[];
  createdAt: string;
}

export interface UserSettings {
  units: 'kg' | 'lb';
  theme: 'light' | 'dark' | 'system';
  restTimerDefault: number;
  weeklyGoal: number;
}

export interface User {
  id: string;
  email?: string;
  settings: UserSettings;
  createdAt: string;
}

export interface PersonalRecord {
  exerciseId: string;
  type: '1rm' | 'maxWeight' | 'maxReps' | 'maxVolume';
  value: number;
  date: string;
  workoutId: string;
}

export interface ProgressionSuggestion {
  action: 'increase_weight' | 'increase_reps' | 'add_set' | 'maintain' | 'reduce_weight';
  newWeight?: number;
  newReps?: number;
  newSets?: number;
  targetReps?: number;
  message: string;
}

export interface ExerciseHistory {
  exerciseId: string;
  date: string;
  bestSet: {
    weight: number;
    reps: number;
  };
  totalVolume: number;
  workingSets: number;
}

// Routine types for saving and reusing workout templates
export interface RoutineExercise {
  id: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
  notes?: string;
}

export interface Routine {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  isTemplate: boolean; // true for built-in templates, false for user-created
  createdAt: string;
  updatedAt: string;
}
