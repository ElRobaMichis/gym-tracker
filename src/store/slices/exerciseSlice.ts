import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Exercise } from '../../types';
import { defaultExercises } from '../../constants/exercises';

interface ExerciseState {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
}

const initialState: ExerciseState = {
  exercises: defaultExercises,
  loading: false,
  error: null,
};

const exerciseSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    addExercise: (state, action: PayloadAction<Exercise>) => {
      state.exercises.push(action.payload);
    },
    updateExercise: (state, action: PayloadAction<Exercise>) => {
      const index = state.exercises.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.exercises[index] = action.payload;
      }
    },
    deleteExercise: (state, action: PayloadAction<string>) => {
      state.exercises = state.exercises.filter(e => e.id !== action.payload);
    },
    setExercises: (state, action: PayloadAction<Exercise[]>) => {
      state.exercises = action.payload;
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
  addExercise,
  updateExercise,
  deleteExercise,
  setExercises,
  setLoading,
  setError,
} = exerciseSlice.actions;

export default exerciseSlice.reducer;
