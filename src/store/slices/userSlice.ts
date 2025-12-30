import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserSettings, PersonalRecord } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface UserState {
  user: User;
  personalRecords: PersonalRecord[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const defaultUser: User = {
  id: uuidv4(),
  settings: {
    units: 'lb',
    theme: 'system',
    restTimerDefault: 90,
    weeklyGoal: 4,
  },
  createdAt: new Date().toISOString(),
};

const initialState: UserState = {
  user: defaultUser,
  personalRecords: [],
  isAuthenticated: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload.email;
    },
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.user.settings = { ...state.user.settings, ...action.payload };
    },
    addPersonalRecord: (state, action: PayloadAction<PersonalRecord>) => {
      const existingIndex = state.personalRecords.findIndex(
        pr =>
          pr.exerciseId === action.payload.exerciseId &&
          pr.type === action.payload.type
      );
      if (existingIndex !== -1) {
        if (action.payload.value > state.personalRecords[existingIndex].value) {
          state.personalRecords[existingIndex] = action.payload;
        }
      } else {
        state.personalRecords.push(action.payload);
      }
    },
    setPersonalRecords: (state, action: PayloadAction<PersonalRecord[]>) => {
      state.personalRecords = action.payload;
    },
    logout: (state) => {
      state.user = { ...defaultUser, id: uuidv4() };
      state.isAuthenticated = false;
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
  setUser,
  updateSettings,
  addPersonalRecord,
  setPersonalRecords,
  logout,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;
