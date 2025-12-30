import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workout, WorkoutExercise, WorkoutSet } from '../../types';

interface WorkoutState {
  workouts: Workout[];
  activeWorkout: Workout | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkoutState = {
  workouts: [],
  activeWorkout: null,
  loading: false,
  error: null,
};

const workoutSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    startWorkout: (state, action: PayloadAction<Workout>) => {
      state.activeWorkout = action.payload;
    },
    endWorkout: (state) => {
      if (state.activeWorkout) {
        state.activeWorkout.completed = true;
        state.activeWorkout.duration = Math.floor(
          (Date.now() - new Date(state.activeWorkout.date).getTime()) / 1000
        );
        state.workouts.unshift(state.activeWorkout);
        state.activeWorkout = null;
      }
    },
    cancelWorkout: (state) => {
      state.activeWorkout = null;
    },
    addExerciseToWorkout: (state, action: PayloadAction<WorkoutExercise>) => {
      if (state.activeWorkout) {
        state.activeWorkout.exercises.push(action.payload);
      }
    },
    removeExerciseFromWorkout: (state, action: PayloadAction<string>) => {
      if (state.activeWorkout) {
        state.activeWorkout.exercises = state.activeWorkout.exercises.filter(
          e => e.id !== action.payload
        );
      }
    },
    addSetToExercise: (
      state,
      action: PayloadAction<{ workoutExerciseId: string; set: WorkoutSet }>
    ) => {
      if (state.activeWorkout) {
        const exercise = state.activeWorkout.exercises.find(
          e => e.id === action.payload.workoutExerciseId
        );
        if (exercise) {
          exercise.sets.push(action.payload.set);
        }
      }
    },
    updateSet: (
      state,
      action: PayloadAction<{
        workoutExerciseId: string;
        setId: string;
        updates: Partial<WorkoutSet>;
      }>
    ) => {
      if (state.activeWorkout) {
        const exercise = state.activeWorkout.exercises.find(
          e => e.id === action.payload.workoutExerciseId
        );
        if (exercise) {
          const set = exercise.sets.find(s => s.id === action.payload.setId);
          if (set) {
            Object.assign(set, action.payload.updates);
          }
        }
      }
    },
    deleteSet: (
      state,
      action: PayloadAction<{ workoutExerciseId: string; setId: string }>
    ) => {
      if (state.activeWorkout) {
        const exercise = state.activeWorkout.exercises.find(
          e => e.id === action.payload.workoutExerciseId
        );
        if (exercise) {
          exercise.sets = exercise.sets.filter(
            s => s.id !== action.payload.setId
          );
          exercise.sets.forEach((s, i) => {
            s.setNumber = i + 1;
          });
        }
      }
    },
    updateWorkoutNotes: (state, action: PayloadAction<string>) => {
      if (state.activeWorkout) {
        state.activeWorkout.notes = action.payload;
      }
    },
    setWorkouts: (state, action: PayloadAction<Workout[]>) => {
      state.workouts = action.payload;
    },
    deleteWorkout: (state, action: PayloadAction<string>) => {
      state.workouts = state.workouts.filter(w => w.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  startWorkout,
  endWorkout,
  cancelWorkout,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSetToExercise,
  updateSet,
  deleteSet,
  updateWorkoutNotes,
  setWorkouts,
  deleteWorkout,
  setLoading,
  setError,
} = workoutSlice.actions;

export default workoutSlice.reducer;
