import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// These will be set up when you create your Supabase project
// Replace with your actual values from https://supabase.com
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helpers
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Database sync helpers
export async function syncWorkoutsToCloud(workouts: any[], userId: string) {
  const { data, error } = await supabase
    .from('workouts')
    .upsert(
      workouts.map(w => ({
        ...w,
        user_id: userId,
      })),
      { onConflict: 'id' }
    );
  return { data, error };
}

export async function fetchWorkoutsFromCloud(userId: string) {
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises (
        *,
        sets (*)
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });
  return { data, error };
}

export async function syncExercisesToCloud(exercises: any[], userId: string) {
  const customExercises = exercises.filter(e => !e.isDefault);
  if (customExercises.length === 0) return { data: null, error: null };

  const { data, error } = await supabase
    .from('exercises')
    .upsert(
      customExercises.map(e => ({
        ...e,
        user_id: userId,
      })),
      { onConflict: 'id' }
    );
  return { data, error };
}

export async function fetchCustomExercisesFromCloud(userId: string) {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
}
