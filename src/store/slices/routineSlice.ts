import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Routine, RoutineExercise } from '../../types';

interface RoutineState {
  routines: Routine[];
  loading: boolean;
  error: string | null;
}

const initialState: RoutineState = {
  routines: [],
  loading: false,
  error: null,
};

const routineSlice = createSlice({
  name: 'routines',
  initialState,
  reducers: {
    addRoutine: (state, action: PayloadAction<Routine>) => {
      state.routines.unshift(action.payload);
    },
    updateRoutine: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Routine> }>
    ) => {
      const routine = state.routines.find(r => r.id === action.payload.id);
      if (routine) {
        Object.assign(routine, action.payload.updates);
        routine.updatedAt = new Date().toISOString();
      }
    },
    deleteRoutine: (state, action: PayloadAction<string>) => {
      state.routines = state.routines.filter(r => r.id !== action.payload);
    },
    markRoutineUsed: (state, action: PayloadAction<string>) => {
      const routine = state.routines.find(r => r.id === action.payload);
      if (routine) {
        routine.lastUsed = new Date().toISOString();
        routine.timesUsed += 1;
      }
    },
    addExerciseToRoutine: (
      state,
      action: PayloadAction<{ routineId: string; exercise: RoutineExercise }>
    ) => {
      const routine = state.routines.find(r => r.id === action.payload.routineId);
      if (routine) {
        routine.exercises.push(action.payload.exercise);
        routine.updatedAt = new Date().toISOString();
      }
    },
    removeExerciseFromRoutine: (
      state,
      action: PayloadAction<{ routineId: string; exerciseId: string }>
    ) => {
      const routine = state.routines.find(r => r.id === action.payload.routineId);
      if (routine) {
        routine.exercises = routine.exercises.filter(
          e => e.id !== action.payload.exerciseId
        );
        // Reorder remaining exercises
        routine.exercises.forEach((e, i) => {
          e.orderIndex = i;
        });
        routine.updatedAt = new Date().toISOString();
      }
    },
    reorderRoutineExercises: (
      state,
      action: PayloadAction<{ routineId: string; exercises: RoutineExercise[] }>
    ) => {
      const routine = state.routines.find(r => r.id === action.payload.routineId);
      if (routine) {
        routine.exercises = action.payload.exercises;
        routine.updatedAt = new Date().toISOString();
      }
    },
    setRoutines: (state, action: PayloadAction<Routine[]>) => {
      state.routines = action.payload;
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
  addRoutine,
  updateRoutine,
  deleteRoutine,
  markRoutineUsed,
  addExerciseToRoutine,
  removeExerciseFromRoutine,
  reorderRoutineExercises,
  setRoutines,
  setLoading,
  setError,
} = routineSlice.actions;

export default routineSlice.reducer;
