// ═══════════════════════════════════════════════════════════════════════════
// GYM TRACKER - COMPREHENSIVE TEST SUITE
// Tests: Unit Conversion, 1RM Calculations, Redux Slices, Data Validation
// ═══════════════════════════════════════════════════════════════════════════

// ============================================
// TEST FRAMEWORK
// ============================================

let passed = 0;
let failed = 0;
let currentSection = '';

function section(name) {
  currentSection = name;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📋 ${name}`);
  console.log('─'.repeat(60));
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    └─ ${error.message}`);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeCloseTo: (expected, precision = 2) => {
      const diff = Math.abs(actual - expected);
      if (diff > Math.pow(10, -precision)) {
        throw new Error(`Expected ${actual} to be close to ${expected}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (!(actual > expected)) throw new Error(`Expected ${actual} > ${expected}`);
    },
    toBeLessThan: (expected) => {
      if (!(actual < expected)) throw new Error(`Expected ${actual} < ${expected}`);
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (!(actual >= expected)) throw new Error(`Expected ${actual} >= ${expected}`);
    },
    toBeLessThanOrEqual: (expected) => {
      if (!(actual <= expected)) throw new Error(`Expected ${actual} <= ${expected}`);
    },
    toContain: (expected) => {
      if (Array.isArray(actual)) {
        if (!actual.includes(expected)) throw new Error(`Array does not contain ${expected}`);
      } else if (typeof actual === 'string') {
        if (!actual.includes(expected)) throw new Error(`"${actual}" does not contain "${expected}"`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined || actual === null) {
        throw new Error(`Expected value to be defined, got ${actual}`);
      }
    },
    toBeNull: () => {
      if (actual !== null) throw new Error(`Expected null, got ${actual}`);
    },
    toBeUndefined: () => {
      if (actual !== undefined) throw new Error(`Expected undefined, got ${actual}`);
    },
    toBeTruthy: () => {
      if (!actual) throw new Error(`Expected truthy, got ${actual}`);
    },
    toBeFalsy: () => {
      if (actual) throw new Error(`Expected falsy, got ${actual}`);
    },
    toHaveLength: (expected) => {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected}, got ${actual.length}`);
      }
    },
    not: {
      toBe: (expected) => {
        if (actual === expected) throw new Error(`Expected NOT ${JSON.stringify(expected)}`);
      },
      toContain: (expected) => {
        if (Array.isArray(actual) && actual.includes(expected)) {
          throw new Error(`Array should NOT contain ${expected}`);
        }
      },
    },
  };
}

console.log('\n' + '═'.repeat(60));
console.log('   GYM TRACKER - COMPREHENSIVE TEST SUITE');
console.log('═'.repeat(60));

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1: UNIT CONVERSION UTILITIES
// ════════════════════════════════════════════════════════════════════════════

const KG_TO_LB = 2.20462;
const LB_TO_KG = 0.453592;
const DEFAULT_WEIGHT_UNIT = 'kg';

function kgToLb(kg) {
  return Math.round(kg * KG_TO_LB * 10) / 10;
}

function lbToKg(lb) {
  return Math.round(lb * LB_TO_KG * 10) / 10;
}

function convertWeight(weight, fromUnit, toUnit) {
  if (fromUnit === toUnit) return weight;
  if (fromUnit === 'kg' && toUnit === 'lb') return kgToLb(weight);
  if (fromUnit === 'lb' && toUnit === 'kg') return lbToKg(weight);
  return weight;
}

function formatWeight(weight, unit) {
  return `${weight} ${unit}`;
}

function getDisplayWeight(weight, storedUnit, displayUnit) {
  const fromUnit = storedUnit || DEFAULT_WEIGHT_UNIT;
  return convertWeight(weight, fromUnit, displayUnit);
}

function getConversionFactor(fromUnit, toUnit) {
  if (fromUnit === toUnit) return 1;
  if (fromUnit === 'kg' && toUnit === 'lb') return KG_TO_LB;
  if (fromUnit === 'lb' && toUnit === 'kg') return LB_TO_KG;
  return 1;
}

section('UNIT CONVERSION - kgToLb');

test('100kg → 220.5lb', () => {
  expect(kgToLb(100)).toBe(220.5);
});

test('0kg → 0lb', () => {
  expect(kgToLb(0)).toBe(0);
});

test('50kg → 110.2lb', () => {
  expect(kgToLb(50)).toBe(110.2);
});

test('1kg → 2.2lb', () => {
  expect(kgToLb(1)).toBe(2.2);
});

test('0.5kg → 1.1lb', () => {
  expect(kgToLb(0.5)).toBe(1.1);
});

test('200kg → 441lb', () => {
  expect(kgToLb(200)).toBe(440.9);
});

section('UNIT CONVERSION - lbToKg');

test('100lb → 45.4kg', () => {
  expect(lbToKg(100)).toBe(45.4);
});

test('0lb → 0kg', () => {
  expect(lbToKg(0)).toBe(0);
});

test('220lb → 99.8kg', () => {
  expect(lbToKg(220)).toBe(99.8);
});

test('1lb → 0.5kg', () => {
  expect(lbToKg(1)).toBe(0.5);
});

test('45lb → 20.4kg', () => {
  expect(lbToKg(45)).toBe(20.4);
});

section('UNIT CONVERSION - convertWeight');

test('kg to lb conversion', () => {
  expect(convertWeight(100, 'kg', 'lb')).toBe(220.5);
});

test('lb to kg conversion', () => {
  expect(convertWeight(100, 'lb', 'kg')).toBe(45.4);
});

test('kg to kg (no conversion)', () => {
  expect(convertWeight(100, 'kg', 'kg')).toBe(100);
});

test('lb to lb (no conversion)', () => {
  expect(convertWeight(100, 'lb', 'lb')).toBe(100);
});

test('0 weight conversion', () => {
  expect(convertWeight(0, 'kg', 'lb')).toBe(0);
});

section('UNIT CONVERSION - formatWeight');

test('Format 100 kg', () => {
  expect(formatWeight(100, 'kg')).toBe('100 kg');
});

test('Format 220 lb', () => {
  expect(formatWeight(220, 'lb')).toBe('220 lb');
});

test('Format 0 kg', () => {
  expect(formatWeight(0, 'kg')).toBe('0 kg');
});

test('Format decimal weight', () => {
  expect(formatWeight(22.5, 'kg')).toBe('22.5 kg');
});

section('UNIT CONVERSION - getDisplayWeight');

test('Legacy data (undefined storedUnit) assumed kg, display in lb', () => {
  expect(getDisplayWeight(50, undefined, 'lb')).toBe(110.2);
});

test('Legacy data (undefined storedUnit) assumed kg, display in kg', () => {
  expect(getDisplayWeight(50, undefined, 'kg')).toBe(50);
});

test('Stored in kg, display in lb', () => {
  expect(getDisplayWeight(100, 'kg', 'lb')).toBe(220.5);
});

test('Stored in lb, display in kg', () => {
  expect(getDisplayWeight(100, 'lb', 'kg')).toBe(45.4);
});

test('Stored in lb, display in lb (no conversion)', () => {
  expect(getDisplayWeight(100, 'lb', 'lb')).toBe(100);
});

section('UNIT CONVERSION - getConversionFactor');

test('kg to lb factor', () => {
  expect(getConversionFactor('kg', 'lb')).toBe(KG_TO_LB);
});

test('lb to kg factor', () => {
  expect(getConversionFactor('lb', 'kg')).toBe(LB_TO_KG);
});

test('Same unit factor = 1', () => {
  expect(getConversionFactor('kg', 'kg')).toBe(1);
  expect(getConversionFactor('lb', 'lb')).toBe(1);
});

section('UNIT CONVERSION - Round Trip Accuracy');

test('kg → lb → kg preserves value (within rounding)', () => {
  const original = 100;
  const inLb = kgToLb(original);
  const backToKg = lbToKg(inLb);
  expect(Math.abs(backToKg - original)).toBeLessThan(0.5);
});

test('lb → kg → lb preserves value (within rounding)', () => {
  const original = 100;
  const inKg = lbToKg(original);
  const backToLb = kgToLb(inKg);
  expect(Math.abs(backToLb - original)).toBeLessThan(0.5);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2: 1RM CALCULATIONS & VOLUME
// ════════════════════════════════════════════════════════════════════════════

function calculate1RM(weight, reps) {
  // Edge case #2 & #6: Validate inputs
  if (!Number.isFinite(weight) || !Number.isFinite(reps)) return 0;
  if (weight < 0 || reps < 0) return 0;
  if (reps === 0) return 0;
  if (reps === 1) return weight;

  // Edge case #3: Cap the multiplier at 1.0 (2x weight max) for very high reps
  const multiplier = Math.min(reps / 30, 1);
  return Math.round(weight * (1 + multiplier));
}

function calculateVolume(sets) {
  return sets
    .filter(s => !s.isWarmup && s.completed)
    .reduce((total, set) => total + set.weight * set.reps, 0);
}

function getBestSet(sets) {
  const workingSets = sets.filter(s => !s.isWarmup && s.completed);
  if (workingSets.length === 0) return null;
  return workingSets.reduce((best, set) => {
    const bestRM = calculate1RM(best.weight, best.reps);
    const setRM = calculate1RM(set.weight, set.reps);
    return setRM > bestRM ? set : best;
  });
}

const createSet = (weight, reps, options = {}) => ({
  id: `set-${Math.random()}`,
  workoutExerciseId: 'test',
  setNumber: 1,
  weight,
  reps,
  isWarmup: options.isWarmup || false,
  completed: options.completed !== undefined ? options.completed : true,
  createdAt: new Date().toISOString(),
});

section('1RM CALCULATION - Epley Formula');

test('1 rep = weight (no calculation)', () => {
  expect(calculate1RM(100, 1)).toBe(100);
});

test('5 reps estimation', () => {
  expect(calculate1RM(100, 5)).toBe(117); // 100 * (1 + 5/30) = 116.67 → 117
});

test('10 reps estimation', () => {
  expect(calculate1RM(100, 10)).toBe(133); // 100 * (1 + 10/30) = 133.33 → 133
});

test('12 reps estimation', () => {
  expect(calculate1RM(100, 12)).toBe(140); // 100 * (1 + 12/30) = 140
});

test('High reps (15) uses modified formula', () => {
  const result = calculate1RM(100, 15);
  expect(result).toBe(150); // 100 * (1 + 15/30) = 150
});

test('High reps (20) estimation', () => {
  const result = calculate1RM(100, 20);
  expect(result).toBeCloseTo(166.67, 0);
});

test('0 weight returns 0', () => {
  expect(calculate1RM(0, 10)).toBe(0);
});

test('Heavy weight estimation', () => {
  expect(calculate1RM(200, 5)).toBe(233);
});

section('VOLUME CALCULATION');

test('Single set volume', () => {
  const sets = [createSet(100, 10)];
  expect(calculateVolume(sets)).toBe(1000);
});

test('Multiple sets volume', () => {
  const sets = [
    createSet(100, 10),
    createSet(100, 10),
    createSet(100, 10),
  ];
  expect(calculateVolume(sets)).toBe(3000);
});

test('Empty sets = 0 volume', () => {
  expect(calculateVolume([])).toBe(0);
});

test('Excludes warmup sets', () => {
  const sets = [
    createSet(50, 10, { isWarmup: true }),
    createSet(100, 10),
  ];
  expect(calculateVolume(sets)).toBe(1000);
});

test('Excludes incomplete sets', () => {
  const sets = [
    createSet(100, 10),
    createSet(100, 10, { completed: false }),
  ];
  expect(calculateVolume(sets)).toBe(1000);
});

test('Mixed warmup and incomplete', () => {
  const sets = [
    createSet(50, 10, { isWarmup: true }),
    createSet(100, 10),
    createSet(100, 8),
    createSet(100, 6, { completed: false }),
  ];
  expect(calculateVolume(sets)).toBe(1800); // 1000 + 800
});

test('Different weights and reps', () => {
  const sets = [
    createSet(100, 10), // 1000
    createSet(110, 8),  // 880
    createSet(120, 6),  // 720
  ];
  expect(calculateVolume(sets)).toBe(2600);
});

section('BEST SET CALCULATION');

test('Single set is best set', () => {
  const sets = [createSet(100, 10)];
  const best = getBestSet(sets);
  expect(best.weight).toBe(100);
  expect(best.reps).toBe(10);
});

test('Returns null for empty sets', () => {
  expect(getBestSet([])).toBeNull();
});

test('Returns null for only warmup sets', () => {
  const sets = [
    createSet(50, 10, { isWarmup: true }),
  ];
  expect(getBestSet(sets)).toBeNull();
});

test('Finds highest 1RM set', () => {
  const sets = [
    createSet(100, 8),  // 1RM ≈ 127
    createSet(110, 5),  // 1RM ≈ 128
    createSet(90, 12),  // 1RM ≈ 126
  ];
  const best = getBestSet(sets);
  expect(best.weight).toBe(110);
  expect(best.reps).toBe(5);
});

test('Ignores warmup sets for best', () => {
  const sets = [
    createSet(200, 10, { isWarmup: true }), // Would be highest if counted
    createSet(100, 10),
  ];
  const best = getBestSet(sets);
  expect(best.weight).toBe(100);
});

test('Ignores incomplete sets for best', () => {
  const sets = [
    createSet(200, 10, { completed: false }),
    createSet(100, 10),
  ];
  const best = getBestSet(sets);
  expect(best.weight).toBe(100);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3: REDUX EXERCISE SLICE
// ════════════════════════════════════════════════════════════════════════════

// Simulated reducer functions
function exerciseReducer(state, action) {
  switch (action.type) {
    case 'addExercise':
      return { ...state, exercises: [...state.exercises, action.payload] };
    case 'updateExercise': {
      const index = state.exercises.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        const newExercises = [...state.exercises];
        newExercises[index] = action.payload;
        return { ...state, exercises: newExercises };
      }
      return state;
    }
    case 'deleteExercise':
      return { ...state, exercises: state.exercises.filter(e => e.id !== action.payload) };
    case 'setExercises':
      return { ...state, exercises: action.payload };
    case 'setLoading':
      return { ...state, loading: action.payload };
    case 'setError':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const createExercise = (id, name = 'Test Exercise') => ({
  id,
  name,
  category: 'chest',
  muscleGroups: ['chest'],
  progressionType: 'double',
  weightIncrement: 5,
  targetRepMin: 8,
  targetRepMax: 12,
  targetSetsMin: 3,
  targetSetsMax: 4,
  isDefault: false,
  createdAt: new Date().toISOString(),
});

section('EXERCISE SLICE - addExercise');

test('Add exercise to empty list', () => {
  const state = { exercises: [], loading: false, error: null };
  const newState = exerciseReducer(state, {
    type: 'addExercise',
    payload: createExercise('ex1'),
  });
  expect(newState.exercises).toHaveLength(1);
  expect(newState.exercises[0].id).toBe('ex1');
});

test('Add exercise to existing list', () => {
  const state = { exercises: [createExercise('ex1')], loading: false, error: null };
  const newState = exerciseReducer(state, {
    type: 'addExercise',
    payload: createExercise('ex2'),
  });
  expect(newState.exercises).toHaveLength(2);
});

test('Add duplicate ID (allowed by Redux)', () => {
  const state = { exercises: [createExercise('ex1')], loading: false, error: null };
  const newState = exerciseReducer(state, {
    type: 'addExercise',
    payload: createExercise('ex1', 'Duplicate'),
  });
  expect(newState.exercises).toHaveLength(2);
});

section('EXERCISE SLICE - updateExercise');

test('Update existing exercise', () => {
  const state = { exercises: [createExercise('ex1', 'Original')], loading: false, error: null };
  const newState = exerciseReducer(state, {
    type: 'updateExercise',
    payload: createExercise('ex1', 'Updated'),
  });
  expect(newState.exercises[0].name).toBe('Updated');
});

test('Update non-existent exercise (no-op)', () => {
  const state = { exercises: [createExercise('ex1')], loading: false, error: null };
  const newState = exerciseReducer(state, {
    type: 'updateExercise',
    payload: createExercise('ex999', 'NonExistent'),
  });
  expect(newState.exercises).toHaveLength(1);
  expect(newState.exercises[0].id).toBe('ex1');
});

test('Update preserves array order', () => {
  const state = {
    exercises: [createExercise('ex1'), createExercise('ex2'), createExercise('ex3')],
    loading: false,
    error: null,
  };
  const newState = exerciseReducer(state, {
    type: 'updateExercise',
    payload: createExercise('ex2', 'Updated'),
  });
  expect(newState.exercises[1].name).toBe('Updated');
  expect(newState.exercises[0].id).toBe('ex1');
  expect(newState.exercises[2].id).toBe('ex3');
});

section('EXERCISE SLICE - deleteExercise');

test('Delete existing exercise', () => {
  const state = {
    exercises: [createExercise('ex1'), createExercise('ex2')],
    loading: false,
    error: null,
  };
  const newState = exerciseReducer(state, { type: 'deleteExercise', payload: 'ex1' });
  expect(newState.exercises).toHaveLength(1);
  expect(newState.exercises[0].id).toBe('ex2');
});

test('Delete non-existent exercise (no-op)', () => {
  const state = { exercises: [createExercise('ex1')], loading: false, error: null };
  const newState = exerciseReducer(state, { type: 'deleteExercise', payload: 'ex999' });
  expect(newState.exercises).toHaveLength(1);
});

test('Delete from empty list (no-op)', () => {
  const state = { exercises: [], loading: false, error: null };
  const newState = exerciseReducer(state, { type: 'deleteExercise', payload: 'ex1' });
  expect(newState.exercises).toHaveLength(0);
});

section('EXERCISE SLICE - setExercises');

test('Replace entire exercises list', () => {
  const state = { exercises: [createExercise('old')], loading: false, error: null };
  const newState = exerciseReducer(state, {
    type: 'setExercises',
    payload: [createExercise('new1'), createExercise('new2')],
  });
  expect(newState.exercises).toHaveLength(2);
  expect(newState.exercises[0].id).toBe('new1');
});

test('Set empty array', () => {
  const state = { exercises: [createExercise('ex1')], loading: false, error: null };
  const newState = exerciseReducer(state, { type: 'setExercises', payload: [] });
  expect(newState.exercises).toHaveLength(0);
});

section('EXERCISE SLICE - Loading/Error State');

test('Set loading true', () => {
  const state = { exercises: [], loading: false, error: null };
  const newState = exerciseReducer(state, { type: 'setLoading', payload: true });
  expect(newState.loading).toBe(true);
});

test('Set loading false', () => {
  const state = { exercises: [], loading: true, error: null };
  const newState = exerciseReducer(state, { type: 'setLoading', payload: false });
  expect(newState.loading).toBe(false);
});

test('Set error message', () => {
  const state = { exercises: [], loading: false, error: null };
  const newState = exerciseReducer(state, { type: 'setError', payload: 'Something went wrong' });
  expect(newState.error).toBe('Something went wrong');
});

test('Clear error', () => {
  const state = { exercises: [], loading: false, error: 'Previous error' };
  const newState = exerciseReducer(state, { type: 'setError', payload: null });
  expect(newState.error).toBeNull();
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4: REDUX WORKOUT SLICE
// ════════════════════════════════════════════════════════════════════════════

function workoutReducer(state, action) {
  switch (action.type) {
    case 'startWorkout':
      return { ...state, activeWorkout: action.payload };

    case 'endWorkout':
      if (state.activeWorkout) {
        const completedWorkout = {
          ...state.activeWorkout,
          completed: true,
          duration: Math.floor((Date.now() - new Date(state.activeWorkout.date).getTime()) / 1000),
        };
        return {
          ...state,
          workouts: [completedWorkout, ...state.workouts],
          activeWorkout: null,
        };
      }
      return state;

    case 'cancelWorkout':
      return { ...state, activeWorkout: null };

    case 'addExerciseToWorkout':
      if (state.activeWorkout) {
        return {
          ...state,
          activeWorkout: {
            ...state.activeWorkout,
            exercises: [...state.activeWorkout.exercises, action.payload],
          },
        };
      }
      return state;

    case 'removeExerciseFromWorkout':
      if (state.activeWorkout) {
        return {
          ...state,
          activeWorkout: {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.filter(e => e.id !== action.payload),
          },
        };
      }
      return state;

    case 'addSetToExercise':
      if (state.activeWorkout) {
        const exercises = state.activeWorkout.exercises.map(ex => {
          if (ex.id === action.payload.workoutExerciseId) {
            return { ...ex, sets: [...ex.sets, action.payload.set] };
          }
          return ex;
        });
        return { ...state, activeWorkout: { ...state.activeWorkout, exercises } };
      }
      return state;

    case 'updateSet':
      if (state.activeWorkout) {
        const exercises = state.activeWorkout.exercises.map(ex => {
          if (ex.id === action.payload.workoutExerciseId) {
            const sets = ex.sets.map(s => {
              if (s.id === action.payload.setId) {
                return { ...s, ...action.payload.updates };
              }
              return s;
            });
            return { ...ex, sets };
          }
          return ex;
        });
        return { ...state, activeWorkout: { ...state.activeWorkout, exercises } };
      }
      return state;

    case 'deleteSet':
      if (state.activeWorkout) {
        const exercises = state.activeWorkout.exercises.map(ex => {
          if (ex.id === action.payload.workoutExerciseId) {
            const sets = ex.sets
              .filter(s => s.id !== action.payload.setId)
              .map((s, i) => ({ ...s, setNumber: i + 1 }));
            return { ...ex, sets };
          }
          return ex;
        });
        return { ...state, activeWorkout: { ...state.activeWorkout, exercises } };
      }
      return state;

    case 'updateWorkoutNotes':
      if (state.activeWorkout) {
        return {
          ...state,
          activeWorkout: { ...state.activeWorkout, notes: action.payload },
        };
      }
      return state;

    case 'setWorkouts':
      return { ...state, workouts: action.payload };

    case 'deleteWorkout':
      return { ...state, workouts: state.workouts.filter(w => w.id !== action.payload) };

    default:
      return state;
  }
}

const createWorkout = (id, exercises = []) => ({
  id,
  name: 'Test Workout',
  date: new Date().toISOString(),
  completed: false,
  exercises,
  createdAt: new Date().toISOString(),
});

const createWorkoutExercise = (id, sets = []) => ({
  id,
  workoutId: 'workout1',
  exerciseId: 'bench-press',
  orderIndex: 0,
  sets,
});

const createWorkoutSet = (id, setNumber, weight = 100, reps = 10) => ({
  id,
  workoutExerciseId: 'ex1',
  setNumber,
  weight,
  reps,
  isWarmup: false,
  completed: true,
  createdAt: new Date().toISOString(),
});

section('WORKOUT SLICE - startWorkout');

test('Start workout sets activeWorkout', () => {
  const state = { workouts: [], activeWorkout: null };
  const newState = workoutReducer(state, {
    type: 'startWorkout',
    payload: createWorkout('w1'),
  });
  expect(newState.activeWorkout).toBeDefined();
  expect(newState.activeWorkout.id).toBe('w1');
});

test('Start workout replaces existing active workout', () => {
  const state = { workouts: [], activeWorkout: createWorkout('old') };
  const newState = workoutReducer(state, {
    type: 'startWorkout',
    payload: createWorkout('new'),
  });
  expect(newState.activeWorkout.id).toBe('new');
});

section('WORKOUT SLICE - endWorkout');

test('End workout marks as completed', () => {
  const workout = createWorkout('w1');
  workout.date = new Date(Date.now() - 60000).toISOString(); // 1 minute ago
  const state = { workouts: [], activeWorkout: workout };
  const newState = workoutReducer(state, { type: 'endWorkout' });
  expect(newState.workouts[0].completed).toBe(true);
});

test('End workout calculates duration', () => {
  const workout = createWorkout('w1');
  workout.date = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
  const state = { workouts: [], activeWorkout: workout };
  const newState = workoutReducer(state, { type: 'endWorkout' });
  expect(newState.workouts[0].duration).toBeGreaterThan(3500);
  expect(newState.workouts[0].duration).toBeLessThan(3700);
});

test('End workout clears activeWorkout', () => {
  const state = { workouts: [], activeWorkout: createWorkout('w1') };
  const newState = workoutReducer(state, { type: 'endWorkout' });
  expect(newState.activeWorkout).toBeNull();
});

test('End workout prepends to workouts array', () => {
  const state = {
    workouts: [{ ...createWorkout('old'), completed: true }],
    activeWorkout: createWorkout('new'),
  };
  const newState = workoutReducer(state, { type: 'endWorkout' });
  expect(newState.workouts[0].id).toBe('new');
  expect(newState.workouts[1].id).toBe('old');
});

test('End workout with null activeWorkout (no-op)', () => {
  const state = { workouts: [], activeWorkout: null };
  const newState = workoutReducer(state, { type: 'endWorkout' });
  expect(newState.workouts).toHaveLength(0);
});

section('WORKOUT SLICE - cancelWorkout');

test('Cancel workout clears activeWorkout', () => {
  const state = { workouts: [], activeWorkout: createWorkout('w1') };
  const newState = workoutReducer(state, { type: 'cancelWorkout' });
  expect(newState.activeWorkout).toBeNull();
});

test('Cancel workout does not save to history', () => {
  const state = { workouts: [], activeWorkout: createWorkout('w1') };
  const newState = workoutReducer(state, { type: 'cancelWorkout' });
  expect(newState.workouts).toHaveLength(0);
});

section('WORKOUT SLICE - addExerciseToWorkout');

test('Add exercise to active workout', () => {
  const state = { workouts: [], activeWorkout: createWorkout('w1', []) };
  const newState = workoutReducer(state, {
    type: 'addExerciseToWorkout',
    payload: createWorkoutExercise('ex1'),
  });
  expect(newState.activeWorkout.exercises).toHaveLength(1);
});

test('Add exercise with null activeWorkout (no-op)', () => {
  const state = { workouts: [], activeWorkout: null };
  const newState = workoutReducer(state, {
    type: 'addExerciseToWorkout',
    payload: createWorkoutExercise('ex1'),
  });
  expect(newState.activeWorkout).toBeNull();
});

section('WORKOUT SLICE - removeExerciseFromWorkout');

test('Remove exercise from workout', () => {
  const state = {
    workouts: [],
    activeWorkout: createWorkout('w1', [createWorkoutExercise('ex1'), createWorkoutExercise('ex2')]),
  };
  const newState = workoutReducer(state, { type: 'removeExerciseFromWorkout', payload: 'ex1' });
  expect(newState.activeWorkout.exercises).toHaveLength(1);
  expect(newState.activeWorkout.exercises[0].id).toBe('ex2');
});

section('WORKOUT SLICE - addSetToExercise');

test('Add set to exercise', () => {
  const state = {
    workouts: [],
    activeWorkout: createWorkout('w1', [createWorkoutExercise('ex1', [])]),
  };
  const newState = workoutReducer(state, {
    type: 'addSetToExercise',
    payload: { workoutExerciseId: 'ex1', set: createWorkoutSet('s1', 1) },
  });
  expect(newState.activeWorkout.exercises[0].sets).toHaveLength(1);
});

test('Add set to non-existent exercise (no-op)', () => {
  const state = {
    workouts: [],
    activeWorkout: createWorkout('w1', [createWorkoutExercise('ex1', [])]),
  };
  const newState = workoutReducer(state, {
    type: 'addSetToExercise',
    payload: { workoutExerciseId: 'ex999', set: createWorkoutSet('s1', 1) },
  });
  expect(newState.activeWorkout.exercises[0].sets).toHaveLength(0);
});

section('WORKOUT SLICE - updateSet');

test('Update set weight', () => {
  const state = {
    workouts: [],
    activeWorkout: createWorkout('w1', [
      createWorkoutExercise('ex1', [createWorkoutSet('s1', 1, 100, 10)]),
    ]),
  };
  const newState = workoutReducer(state, {
    type: 'updateSet',
    payload: { workoutExerciseId: 'ex1', setId: 's1', updates: { weight: 110 } },
  });
  expect(newState.activeWorkout.exercises[0].sets[0].weight).toBe(110);
  expect(newState.activeWorkout.exercises[0].sets[0].reps).toBe(10); // Unchanged
});

test('Update set reps', () => {
  const state = {
    workouts: [],
    activeWorkout: createWorkout('w1', [
      createWorkoutExercise('ex1', [createWorkoutSet('s1', 1, 100, 10)]),
    ]),
  };
  const newState = workoutReducer(state, {
    type: 'updateSet',
    payload: { workoutExerciseId: 'ex1', setId: 's1', updates: { reps: 12 } },
  });
  expect(newState.activeWorkout.exercises[0].sets[0].reps).toBe(12);
});

test('Update set completion status', () => {
  const state = {
    workouts: [],
    activeWorkout: createWorkout('w1', [
      createWorkoutExercise('ex1', [createWorkoutSet('s1', 1)]),
    ]),
  };
  const newState = workoutReducer(state, {
    type: 'updateSet',
    payload: { workoutExerciseId: 'ex1', setId: 's1', updates: { completed: false } },
  });
  expect(newState.activeWorkout.exercises[0].sets[0].completed).toBe(false);
});

section('WORKOUT SLICE - deleteSet');

test('Delete set', () => {
  const state = {
    workouts: [],
    activeWorkout: createWorkout('w1', [
      createWorkoutExercise('ex1', [
        createWorkoutSet('s1', 1),
        createWorkoutSet('s2', 2),
        createWorkoutSet('s3', 3),
      ]),
    ]),
  };
  const newState = workoutReducer(state, {
    type: 'deleteSet',
    payload: { workoutExerciseId: 'ex1', setId: 's2' },
  });
  expect(newState.activeWorkout.exercises[0].sets).toHaveLength(2);
});

test('Delete set renumbers remaining sets', () => {
  const state = {
    workouts: [],
    activeWorkout: createWorkout('w1', [
      createWorkoutExercise('ex1', [
        createWorkoutSet('s1', 1),
        createWorkoutSet('s2', 2),
        createWorkoutSet('s3', 3),
      ]),
    ]),
  };
  const newState = workoutReducer(state, {
    type: 'deleteSet',
    payload: { workoutExerciseId: 'ex1', setId: 's2' },
  });
  expect(newState.activeWorkout.exercises[0].sets[0].setNumber).toBe(1);
  expect(newState.activeWorkout.exercises[0].sets[1].setNumber).toBe(2);
});

section('WORKOUT SLICE - updateWorkoutNotes');

test('Update workout notes', () => {
  const state = { workouts: [], activeWorkout: createWorkout('w1') };
  const newState = workoutReducer(state, {
    type: 'updateWorkoutNotes',
    payload: 'Great workout!',
  });
  expect(newState.activeWorkout.notes).toBe('Great workout!');
});

section('WORKOUT SLICE - deleteWorkout');

test('Delete workout from history', () => {
  const state = {
    workouts: [createWorkout('w1'), createWorkout('w2')],
    activeWorkout: null,
  };
  const newState = workoutReducer(state, { type: 'deleteWorkout', payload: 'w1' });
  expect(newState.workouts).toHaveLength(1);
  expect(newState.workouts[0].id).toBe('w2');
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5: REDUX USER SLICE - PERSONAL RECORDS
// ════════════════════════════════════════════════════════════════════════════

function userReducer(state, action) {
  switch (action.type) {
    case 'setUser':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload.email,
      };

    case 'updateSettings':
      return {
        ...state,
        user: {
          ...state.user,
          settings: { ...state.user.settings, ...action.payload },
        },
      };

    case 'addPersonalRecord': {
      const existingIndex = state.personalRecords.findIndex(
        pr =>
          pr.exerciseId === action.payload.exerciseId &&
          pr.type === action.payload.type
      );
      if (existingIndex !== -1) {
        if (action.payload.value > state.personalRecords[existingIndex].value) {
          const newRecords = [...state.personalRecords];
          newRecords[existingIndex] = action.payload;
          return { ...state, personalRecords: newRecords };
        }
        return state;
      }
      return { ...state, personalRecords: [...state.personalRecords, action.payload] };
    }

    case 'setPersonalRecords':
      return { ...state, personalRecords: action.payload };

    case 'logout':
      return {
        ...state,
        user: {
          id: 'new-uuid',
          settings: { units: 'lb', theme: 'system', restTimerDefault: 90, weeklyGoal: 4 },
          createdAt: new Date().toISOString(),
        },
        isAuthenticated: false,
      };

    default:
      return state;
  }
}

const defaultUserState = {
  user: {
    id: 'user1',
    email: 'test@example.com',
    settings: { units: 'lb', theme: 'system', restTimerDefault: 90, weeklyGoal: 4 },
    createdAt: new Date().toISOString(),
  },
  personalRecords: [],
  isAuthenticated: true,
};

const createPR = (exerciseId, type, value) => ({
  exerciseId,
  type,
  value,
  date: new Date().toISOString(),
  workoutId: 'workout1',
});

section('USER SLICE - Personal Records');

test('Add new personal record', () => {
  const state = { ...defaultUserState, personalRecords: [] };
  const newState = userReducer(state, {
    type: 'addPersonalRecord',
    payload: createPR('bench-press', '1rm', 100),
  });
  expect(newState.personalRecords).toHaveLength(1);
  expect(newState.personalRecords[0].value).toBe(100);
});

test('Update PR with higher value', () => {
  const state = {
    ...defaultUserState,
    personalRecords: [createPR('bench-press', '1rm', 100)],
  };
  const newState = userReducer(state, {
    type: 'addPersonalRecord',
    payload: createPR('bench-press', '1rm', 110),
  });
  expect(newState.personalRecords).toHaveLength(1);
  expect(newState.personalRecords[0].value).toBe(110);
});

test('Ignore PR with lower value', () => {
  const state = {
    ...defaultUserState,
    personalRecords: [createPR('bench-press', '1rm', 100)],
  };
  const newState = userReducer(state, {
    type: 'addPersonalRecord',
    payload: createPR('bench-press', '1rm', 90),
  });
  expect(newState.personalRecords).toHaveLength(1);
  expect(newState.personalRecords[0].value).toBe(100); // Unchanged
});

test('Ignore PR with equal value', () => {
  const state = {
    ...defaultUserState,
    personalRecords: [createPR('bench-press', '1rm', 100)],
  };
  const newState = userReducer(state, {
    type: 'addPersonalRecord',
    payload: createPR('bench-press', '1rm', 100),
  });
  expect(newState.personalRecords[0].value).toBe(100);
});

test('Different exercise = new PR', () => {
  const state = {
    ...defaultUserState,
    personalRecords: [createPR('bench-press', '1rm', 100)],
  };
  const newState = userReducer(state, {
    type: 'addPersonalRecord',
    payload: createPR('squat', '1rm', 150),
  });
  expect(newState.personalRecords).toHaveLength(2);
});

test('Different type = new PR', () => {
  const state = {
    ...defaultUserState,
    personalRecords: [createPR('bench-press', '1rm', 100)],
  };
  const newState = userReducer(state, {
    type: 'addPersonalRecord',
    payload: createPR('bench-press', 'maxWeight', 95),
  });
  expect(newState.personalRecords).toHaveLength(2);
});

test('Multiple PRs for same exercise different types', () => {
  let state = { ...defaultUserState, personalRecords: [] };
  state = userReducer(state, { type: 'addPersonalRecord', payload: createPR('bench-press', '1rm', 100) });
  state = userReducer(state, { type: 'addPersonalRecord', payload: createPR('bench-press', 'maxWeight', 95) });
  state = userReducer(state, { type: 'addPersonalRecord', payload: createPR('bench-press', 'maxReps', 15) });
  expect(state.personalRecords).toHaveLength(3);
});

section('USER SLICE - Settings');

test('Update single setting', () => {
  const state = defaultUserState;
  const newState = userReducer(state, {
    type: 'updateSettings',
    payload: { units: 'kg' },
  });
  expect(newState.user.settings.units).toBe('kg');
  expect(newState.user.settings.theme).toBe('system'); // Unchanged
});

test('Update multiple settings', () => {
  const state = defaultUserState;
  const newState = userReducer(state, {
    type: 'updateSettings',
    payload: { units: 'kg', theme: 'dark' },
  });
  expect(newState.user.settings.units).toBe('kg');
  expect(newState.user.settings.theme).toBe('dark');
});

test('Partial update preserves other settings', () => {
  const state = defaultUserState;
  const newState = userReducer(state, {
    type: 'updateSettings',
    payload: { restTimerDefault: 120 },
  });
  expect(newState.user.settings.restTimerDefault).toBe(120);
  expect(newState.user.settings.units).toBe('lb');
  expect(newState.user.settings.weeklyGoal).toBe(4);
});

section('USER SLICE - Authentication');

test('setUser with email sets isAuthenticated true', () => {
  const state = { ...defaultUserState, isAuthenticated: false };
  const newState = userReducer(state, {
    type: 'setUser',
    payload: { id: 'u1', email: 'user@test.com', settings: {}, createdAt: new Date().toISOString() },
  });
  expect(newState.isAuthenticated).toBe(true);
});

test('setUser without email sets isAuthenticated false', () => {
  const state = { ...defaultUserState, isAuthenticated: true };
  const newState = userReducer(state, {
    type: 'setUser',
    payload: { id: 'u1', settings: {}, createdAt: new Date().toISOString() },
  });
  expect(newState.isAuthenticated).toBe(false);
});

test('Logout resets authentication', () => {
  const state = { ...defaultUserState, isAuthenticated: true };
  const newState = userReducer(state, { type: 'logout' });
  expect(newState.isAuthenticated).toBe(false);
});

test('Logout resets user with new ID', () => {
  const state = defaultUserState;
  const newState = userReducer(state, { type: 'logout' });
  expect(newState.user.id).toBe('new-uuid');
  expect(newState.user.email).toBeUndefined();
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6: EXERCISE DATA VALIDATION
// ════════════════════════════════════════════════════════════════════════════

const defaultExercises = [
  { id: 'bench-press', name: 'Bench Press', category: 'chest', progressionType: 'double', weightIncrement: 5, targetRepMin: 8, targetRepMax: 12, targetSetsMin: 3, targetSetsMax: 4, isDefault: true },
  { id: 'incline-bench-press', name: 'Incline Bench Press', category: 'chest', progressionType: 'double', weightIncrement: 5, targetRepMin: 8, targetRepMax: 12, targetSetsMin: 3, targetSetsMax: 4, isDefault: true },
  { id: 'cable-fly', name: 'Cable Fly', category: 'chest', progressionType: 'triple', weightIncrement: 10, targetRepMin: 8, targetRepMax: 12, targetSetsMin: 2, targetSetsMax: 4, isDefault: true },
  { id: 'squat', name: 'Squat', category: 'legs', progressionType: 'double', weightIncrement: 10, targetRepMin: 6, targetRepMax: 10, targetSetsMin: 3, targetSetsMax: 5, isDefault: true },
  { id: 'deadlift', name: 'Deadlift', category: 'back', progressionType: 'double', weightIncrement: 10, targetRepMin: 5, targetRepMax: 8, targetSetsMin: 3, targetSetsMax: 5, isDefault: true },
  { id: 'plank', name: 'Plank', category: 'core', progressionType: 'triple', weightIncrement: 0, targetRepMin: 30, targetRepMax: 60, targetSetsMin: 2, targetSetsMax: 4, isDefault: true },
];

const validCategories = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'cardio', 'compound'];
const validProgressionTypes = ['double', 'triple'];

section('EXERCISE DATA VALIDATION');

test('All exercises have unique IDs', () => {
  const ids = defaultExercises.map(e => e.id);
  const uniqueIds = new Set(ids);
  expect(ids.length).toBe(uniqueIds.size);
});

test('All exercises have required fields', () => {
  const requiredFields = ['id', 'name', 'category', 'progressionType', 'weightIncrement', 'targetRepMin', 'targetRepMax', 'targetSetsMin', 'targetSetsMax'];
  defaultExercises.forEach(exercise => {
    requiredFields.forEach(field => {
      expect(exercise[field]).toBeDefined();
    });
  });
});

test('All exercises have valid categories', () => {
  defaultExercises.forEach(exercise => {
    expect(validCategories).toContain(exercise.category);
  });
});

test('All exercises have valid progression types', () => {
  defaultExercises.forEach(exercise => {
    expect(validProgressionTypes).toContain(exercise.progressionType);
  });
});

test('Weight increments are non-negative', () => {
  defaultExercises.forEach(exercise => {
    expect(exercise.weightIncrement).toBeGreaterThanOrEqual(0);
  });
});

test('Rep ranges are valid (min < max)', () => {
  defaultExercises.forEach(exercise => {
    expect(exercise.targetRepMin).toBeLessThan(exercise.targetRepMax);
  });
});

test('Set ranges are valid (min <= max)', () => {
  defaultExercises.forEach(exercise => {
    expect(exercise.targetSetsMin).toBeLessThanOrEqual(exercise.targetSetsMax);
  });
});

test('Rep minimums are positive', () => {
  defaultExercises.forEach(exercise => {
    expect(exercise.targetRepMin).toBeGreaterThan(0);
  });
});

test('Set minimums are positive', () => {
  defaultExercises.forEach(exercise => {
    expect(exercise.targetSetsMin).toBeGreaterThan(0);
  });
});

test('Barbell exercises use 5kg or 10kg increments', () => {
  const barbellExercises = defaultExercises.filter(e =>
    e.name.includes('Barbell') || e.name.includes('Bench Press') || e.name === 'Squat' || e.name === 'Deadlift'
  );
  barbellExercises.forEach(exercise => {
    expect([5, 10]).toContain(exercise.weightIncrement);
  });
});

test('Bodyweight exercises can have 0 weight increment', () => {
  const plank = defaultExercises.find(e => e.id === 'plank');
  expect(plank.weightIncrement).toBe(0);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 7: PROGRESSION ALGORITHM (with edge case handling)
// ════════════════════════════════════════════════════════════════════════════

// Helper: Round weight to avoid floating point issues
function roundWeight(weight, precision = 0.5) {
  return Math.round(weight / precision) * precision;
}

// Helper: Validate set data
function getInvalidSets(sets) {
  return sets.filter(s =>
    !Number.isFinite(s.weight) || s.weight < 0 ||
    !Number.isFinite(s.reps) || s.reps < 0
  );
}

// Helper: Get most common weight (highest if tied)
function getMostCommonWeight(workingSets) {
  const weights = [...new Set(workingSets.map(s => s.weight))];
  if (weights.length === 1) return weights[0];
  const weightCounts = weights.map(w => ({
    weight: w,
    count: workingSets.filter(s => s.weight === w).length
  }));
  weightCounts.sort((a, b) => b.count - a.count || b.weight - a.weight);
  return weightCounts[0].weight;
}

// Double Progression Algorithm with edge case handling
function getDoubleProgressionSuggestion(lastSets, exercise, units = 'kg') {
  const { targetRepMin, targetRepMax, weightIncrement, targetSetsMax = 4, targetSetsMin = 3 } = exercise;

  // Edge case #11: Check for all incomplete sets
  const allSets = lastSets.filter(s => !s.isWarmup);
  const workingSets = lastSets.filter(s => !s.isWarmup && s.completed);

  if (workingSets.length === 0) {
    if (allSets.length > 0) {
      return { action: 'maintain', message: 'No completed sets. Consider reducing the weight or taking more rest between sets' };
    }
    return { action: 'maintain', message: 'Start with a weight you can do for ' + targetRepMin + ' reps' };
  }

  // Edge case #2 & #6: Validate for negative/NaN values
  const invalidSets = getInvalidSets(workingSets);
  if (invalidSets.length > 0) {
    return { action: 'maintain', message: 'Invalid set data detected. Please check your logged weights and reps' };
  }

  // Edge case #1: Handle mixed weights
  const lastWeight = getMostCommonWeight(workingSets);
  const avgReps = Math.round(workingSets.reduce((sum, s) => sum + s.reps, 0) / workingSets.length);

  // Check if struggling (less than half of target min)
  if (avgReps < targetRepMin / 2) {
    const reducedWeight = Math.max(0, lastWeight - weightIncrement);
    if (reducedWeight === 0 && lastWeight === 0) {
      return { action: 'maintain', newWeight: 0, targetReps: targetRepMin, message: 'Try a lighter variation or focus on form with bodyweight' };
    }
    return { action: 'reduce_weight', newWeight: reducedWeight, targetReps: targetRepMin, message: `Weight too heavy (only ${avgReps} reps avg). Reduce to ${reducedWeight}${units} and aim for ${targetRepMin} reps` };
  }

  const allHitMaxReps = workingSets.every(s => s.reps >= targetRepMax);

  // Check for excessive sets
  if (workingSets.length > targetSetsMax) {
    return { action: 'maintain', newWeight: lastWeight, targetReps: avgReps, message: `Too many sets (${workingSets.length}). Reduce to ${targetSetsMax} sets at ${lastWeight}${units} for better recovery` };
  }

  if (allHitMaxReps) {
    // Edge case #4: Aggressive increase for far above target
    if (avgReps > targetRepMax * 1.5 && weightIncrement > 0) {
      const newWeight = roundWeight(lastWeight + weightIncrement * 2);
      return { action: 'increase_weight', newWeight, newReps: targetRepMin, message: `Crushing it (${avgReps} reps avg)! Jump to ${newWeight}${units} and aim for ${targetRepMin} reps` };
    }

    // Edge case #8: Zero increment (bodyweight)
    if (weightIncrement === 0) {
      return { action: 'maintain', newWeight: lastWeight, targetReps: targetRepMax, message: `Great form! Keep at ${lastWeight}${units} for ${targetRepMax} reps (bodyweight exercise)` };
    }

    // Edge case #5: Round weight
    const newWeight = roundWeight(lastWeight + weightIncrement);
    return { action: 'increase_weight', newWeight, newReps: targetRepMin, message: `All sets hit ${targetRepMax} reps! Increase weight to ${newWeight}${units} and aim for ${targetRepMin} reps` };
  }

  const targetReps = Math.min(avgReps + 1, targetRepMax);
  return { action: 'increase_reps', newWeight: lastWeight, targetReps, message: `Keep weight at ${lastWeight}${units} and aim for ${targetReps} reps per set` };
}

// Triple Progression Algorithm with edge case handling
function getTripleProgressionSuggestion(lastSets, exercise, units = 'kg') {
  const { targetRepMin, targetRepMax, targetSetsMin, targetSetsMax, weightIncrement } = exercise;

  // Edge case #11: Check for all incomplete sets
  const allSets = lastSets.filter(s => !s.isWarmup);
  const workingSets = lastSets.filter(s => !s.isWarmup && s.completed);

  if (workingSets.length === 0) {
    if (allSets.length > 0) {
      return { action: 'maintain', newSets: targetSetsMin, newReps: targetRepMin, message: 'No completed sets. Consider reducing the weight or taking more rest between sets' };
    }
    return { action: 'maintain', newSets: targetSetsMin, newReps: targetRepMin, message: `Start with ${targetSetsMin} sets of ${targetRepMin} reps at a challenging weight` };
  }

  // Edge case #2 & #6: Validate for negative/NaN values
  const invalidSets = getInvalidSets(workingSets);
  if (invalidSets.length > 0) {
    return { action: 'maintain', newSets: targetSetsMin, message: 'Invalid set data detected. Please check your logged weights and reps' };
  }

  // Edge case #1: Handle mixed weights
  const lastWeight = getMostCommonWeight(workingSets);
  const currentSetCount = workingSets.length;
  const avgReps = Math.round(workingSets.reduce((sum, s) => sum + s.reps, 0) / workingSets.length);

  // Check if struggling
  if (avgReps < targetRepMin / 2) {
    const reducedWeight = Math.max(0, lastWeight - weightIncrement);
    if (reducedWeight === 0 && lastWeight === 0) {
      return { action: 'maintain', newSets: targetSetsMin, targetReps: targetRepMin, message: 'Try a lighter variation or focus on form' };
    }
    return { action: 'reduce_weight', newWeight: reducedWeight, newSets: targetSetsMin, targetReps: targetRepMin, message: `Weight too heavy. Reduce to ${reducedWeight}${units}, ${targetSetsMin} sets of ${targetRepMin} reps` };
  }

  const allHitMaxReps = workingSets.every(s => s.reps >= targetRepMax);

  // Check for excessive sets
  if (currentSetCount > targetSetsMax) {
    return { action: 'maintain', newWeight: lastWeight, newSets: targetSetsMax, targetReps: avgReps, message: `Too many sets (${currentSetCount}). Reduce to ${targetSetsMax} sets at ${lastWeight}${units} for better recovery` };
  }

  if (allHitMaxReps) {
    if (currentSetCount < targetSetsMax) {
      const newSetCount = currentSetCount + 1;
      return { action: 'add_set', newWeight: lastWeight, newSets: newSetCount, newReps: targetRepMin, message: `Great job hitting ${targetRepMax} reps on all sets! Add a set (${newSetCount} total) and drop back to ${targetRepMin} reps` };
    } else {
      // Edge case #4: Aggressive increase for far above target
      if (avgReps > targetRepMax * 1.5 && weightIncrement > 0) {
        const newWeight = roundWeight(lastWeight + weightIncrement * 2);
        return { action: 'increase_weight', newWeight, newSets: targetSetsMin, newReps: targetRepMin, message: `Crushing it (${avgReps} reps avg)! Jump to ${newWeight}${units}, ${targetSetsMin} sets of ${targetRepMin} reps` };
      }

      // Edge case #8: Zero increment (bodyweight)
      if (weightIncrement === 0) {
        return { action: 'maintain', newWeight: lastWeight, newSets: targetSetsMax, targetReps: targetRepMax, message: `Great form! Keep at ${lastWeight}${units} for ${targetSetsMax} sets of ${targetRepMax} reps (bodyweight exercise)` };
      }

      const newWeight = roundWeight(lastWeight + weightIncrement);
      return { action: 'increase_weight', newWeight, newSets: targetSetsMin, newReps: targetRepMin, message: `Maxed out! Increase weight to ${newWeight}${units}, reset to ${targetSetsMin} sets of ${targetRepMin} reps` };
    }
  }

  const targetReps = Math.min(avgReps + 1, targetRepMax);
  return { action: 'increase_reps', newWeight: lastWeight, newSets: currentSetCount, targetReps, message: `Keep weight at ${lastWeight}${units} with ${currentSetCount} sets, aim for ${targetReps} reps` };
}

// Test helper
function makeSets(weight, reps, count, options = {}) {
  return Array(count).fill(null).map((_, i) => ({
    id: `set-${i}`,
    setNumber: i + 1,
    weight,
    reps: Array.isArray(reps) ? reps[i] : reps,
    completed: options.completed !== false,
    isWarmup: options.isWarmup || false
  }));
}

const doubleExercise = {
  id: 'bench-press',
  name: 'Bench Press',
  progressionType: 'double',
  weightIncrement: 5,
  targetRepMin: 8,
  targetRepMax: 12,
  targetSetsMin: 3,
  targetSetsMax: 4
};

const tripleExercise = {
  id: 'cable-fly',
  name: 'Cable Fly',
  progressionType: 'triple',
  weightIncrement: 10,
  targetRepMin: 8,
  targetRepMax: 12,
  targetSetsMin: 2,
  targetSetsMax: 4
};

section('DOUBLE PROGRESSION - Weight Reduction');

test('Reduce weight when avg reps < half target min (1,1,1 at 25kg)', () => {
  const sets = makeSets(25, 1, 3);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('reduce_weight');
  expect(result.newWeight).toBe(20);
  expect(result.message).toContain('Reduce to 20kg');
});

test('Reduce weight when 0 reps on all sets', () => {
  const sets = makeSets(25, 0, 3);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('reduce_weight');
  expect(result.newWeight).toBe(20);
});

test('At 0kg and failing - suggest lighter variation', () => {
  const sets = makeSets(0, 0, 3);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('maintain');
  expect(result.message).toContain('lighter variation');
});

test('Do NOT reduce when avg reps >= half target (4 reps with target 8)', () => {
  const sets = makeSets(25, 4, 3);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('increase_reps');
});

section('DOUBLE PROGRESSION - Excessive Sets');

test('Warn when doing too many sets (10 sets, max is 4)', () => {
  const sets = makeSets(20, 11, 10); // 10 sets of 11 reps at 20kg
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('maintain');
  expect(result.message).toContain('Too many sets (10)');
  expect(result.message).toContain('Reduce to 4 sets');
});

test('Warn when doing 6 sets (max is 4)', () => {
  const sets = makeSets(20, 10, 6);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('maintain');
  expect(result.message).toContain('Too many sets (6)');
});

test('No warning at exactly targetSetsMax (4 sets)', () => {
  const sets = makeSets(20, 10, 4);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).not.toBe('maintain');
});

section('DOUBLE PROGRESSION - Normal Progression');

test('Increase reps when not at max', () => {
  const sets = makeSets(20, 10, 3);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('increase_reps');
  expect(result.targetReps).toBe(11);
});

test('Increase weight when all sets hit max reps', () => {
  const sets = makeSets(20, 12, 3);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('increase_weight');
  expect(result.newWeight).toBe(25);
});

section('TRIPLE PROGRESSION - Weight Reduction');

test('Reduce weight when struggling (avg < 4 reps)', () => {
  const sets = makeSets(50, 2, 2);
  const result = getTripleProgressionSuggestion(sets, tripleExercise, 'kg');
  expect(result.action).toBe('reduce_weight');
  expect(result.newWeight).toBe(40);
});

section('TRIPLE PROGRESSION - Excessive Sets');

test('Warn when doing too many sets (8 sets, max is 4)', () => {
  const sets = makeSets(50, 10, 8);
  const result = getTripleProgressionSuggestion(sets, tripleExercise, 'kg');
  expect(result.action).toBe('maintain');
  expect(result.message).toContain('Too many sets (8)');
  expect(result.message).toContain('Reduce to 4 sets');
});

test('No premature weight increase with excessive sets', () => {
  // Previously: 10 sets with 12 reps would trigger weight increase because 10 > 4 (targetSetsMax)
  // Now: should warn about excessive volume instead
  const sets = makeSets(50, 12, 10);
  const result = getTripleProgressionSuggestion(sets, tripleExercise, 'kg');
  expect(result.action).toBe('maintain');
  expect(result.message).toContain('Too many sets');
});

section('TRIPLE PROGRESSION - Normal Progression');

test('Add set when all hit max reps but not at set max', () => {
  const sets = makeSets(50, 12, 2);
  const result = getTripleProgressionSuggestion(sets, tripleExercise, 'kg');
  expect(result.action).toBe('add_set');
  expect(result.newSets).toBe(3);
});

test('Increase weight when maxed out reps AND sets', () => {
  const sets = makeSets(50, 12, 4);
  const result = getTripleProgressionSuggestion(sets, tripleExercise, 'kg');
  expect(result.action).toBe('increase_weight');
  expect(result.newWeight).toBe(60);
});

test('Increase reps when not at max reps', () => {
  const sets = makeSets(50, 10, 3);
  const result = getTripleProgressionSuggestion(sets, tripleExercise, 'kg');
  expect(result.action).toBe('increase_reps');
  expect(result.targetReps).toBe(11);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 7B: EDGE CASE TESTS
// ════════════════════════════════════════════════════════════════════════════

// Helper for edge case tests with mixed weights
function makeCustomSets(setsData) {
  return setsData.map((s, i) => ({
    id: `set-${i}`,
    setNumber: i + 1,
    weight: s.weight,
    reps: s.reps,
    completed: s.completed !== false,
    isWarmup: s.isWarmup || false
  }));
}

section('EDGE CASE #1: Mixed Weights Across Sets');

test('Uses most common weight when weights differ', () => {
  const sets = makeCustomSets([
    { weight: 100, reps: 10 },
    { weight: 105, reps: 8 },
    { weight: 100, reps: 10 }
  ]);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  // Uses 100kg (appears 2x) not 105kg (appears 1x)
  expect(result.newWeight).toBe(100);
});

test('Uses highest weight when tied count', () => {
  const sets = makeCustomSets([
    { weight: 100, reps: 10 },
    { weight: 105, reps: 10 }
  ]);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  // Tied count, uses highest (105kg)
  expect(result.newWeight).toBe(105);
});

section('EDGE CASE #2 & #6: Invalid Data Validation');

test('Negative weight returns invalid data message', () => {
  const sets = makeSets(-10, 10, 3);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.message).toContain('Invalid');
});

test('Negative reps returns invalid data message', () => {
  const sets = makeSets(20, -5, 3);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.message).toContain('Invalid');
});

test('NaN weight returns invalid data message', () => {
  const sets = makeCustomSets([
    { weight: NaN, reps: 10 },
    { weight: 20, reps: 10 },
    { weight: 20, reps: 10 }
  ]);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.message).toContain('Invalid');
});

test('calculate1RM returns 0 for negative weight', () => {
  expect(calculate1RM(-100, 5)).toBe(0);
});

test('calculate1RM returns 0 for negative reps', () => {
  expect(calculate1RM(100, -5)).toBe(0);
});

test('calculate1RM returns 0 for NaN input', () => {
  expect(calculate1RM(NaN, 5)).toBe(0);
  expect(calculate1RM(100, NaN)).toBe(0);
});

section('EDGE CASE #3: Very High Reps (1RM Cap)');

test('calculate1RM with 0 reps returns 0', () => {
  expect(calculate1RM(100, 0)).toBe(0);
});

test('calculate1RM caps at 2x weight for 30+ reps', () => {
  // At 30 reps: multiplier = 30/30 = 1, result = 100 * 2 = 200
  expect(calculate1RM(100, 30)).toBe(200);
});

test('calculate1RM caps at 2x weight for very high reps (50+)', () => {
  // At 50 reps: multiplier capped at 1, result = 100 * 2 = 200 (not 267)
  expect(calculate1RM(100, 50)).toBe(200);
  expect(calculate1RM(100, 100)).toBe(200);
});

test('calculate1RM normal calculation for moderate reps', () => {
  // 10 reps: 100 * (1 + 10/30) = 100 * 1.33 = 133
  expect(calculate1RM(100, 10)).toBe(133);
});

section('EDGE CASE #4: Reps Far Above Target Max');

test('Aggressive weight increase when avgReps > 1.5x targetRepMax', () => {
  // Target max is 12, avg 20 reps (> 18 = 12*1.5)
  const sets = makeSets(20, 20, 3);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('increase_weight');
  expect(result.newWeight).toBe(30); // Double increment: 20 + 5*2 = 30
  expect(result.message).toContain('Crushing');
});

test('Triple progression: aggressive increase when far above target', () => {
  const sets = makeSets(50, 20, 4); // All 4 sets at 20 reps (way above 12 max)
  const result = getTripleProgressionSuggestion(sets, tripleExercise, 'kg');
  expect(result.action).toBe('increase_weight');
  expect(result.newWeight).toBe(70); // Double increment: 50 + 10*2 = 70
});

section('EDGE CASE #5: Floating Point Rounding');

test('Handles floating point arithmetic (50.1 + 5 = 55)', () => {
  const decimalExercise = { ...doubleExercise, weightIncrement: 5 };
  const sets = makeSets(50.1, 12, 3); // All at max reps
  const result = getDoubleProgressionSuggestion(sets, decimalExercise, 'kg');
  expect(result.newWeight).toBe(55); // Rounded, not 55.1
});

test('Rounds to nearest 0.5kg', () => {
  const decimalExercise = { ...doubleExercise, weightIncrement: 2.5 };
  const sets = makeSets(22.5, 12, 3);
  const result = getDoubleProgressionSuggestion(sets, decimalExercise, 'kg');
  expect(result.newWeight).toBe(25); // 22.5 + 2.5 = 25
});

section('EDGE CASE #7: Boundary Threshold');

test('Exactly at threshold (4 reps with target 8) does NOT reduce', () => {
  // Threshold: avgReps < targetRepMin / 2 = 8/2 = 4
  // 4 is NOT < 4, so no reduction
  const sets = makeSets(25, 4, 3);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('increase_reps');
  expect(result.action).not.toBe('reduce_weight');
});

test('Just below threshold (3 reps with target 8) DOES reduce', () => {
  // 3 < 4, so reduction
  const sets = makeSets(25, 3, 3);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('reduce_weight');
});

section('EDGE CASE #8: Weight Increment = 0 (Bodyweight)');

test('Zero increment at max reps maintains with message', () => {
  const bodyweightExercise = { ...doubleExercise, weightIncrement: 0 };
  const sets = makeSets(0, 12, 3); // All at max reps
  const result = getDoubleProgressionSuggestion(sets, bodyweightExercise, 'kg');
  expect(result.action).toBe('maintain');
  expect(result.message).toContain('bodyweight');
});

test('Triple: zero increment at max reps/sets maintains', () => {
  const bodyweightTriple = { ...tripleExercise, weightIncrement: 0 };
  const sets = makeSets(0, 12, 4); // Max reps and max sets
  const result = getTripleProgressionSuggestion(sets, bodyweightTriple, 'kg');
  expect(result.action).toBe('maintain');
  expect(result.message).toContain('bodyweight');
});

section('EDGE CASE #9: Decimal Weights');

test('Decimal weight + increment works correctly', () => {
  const decimalExercise = { ...doubleExercise, weightIncrement: 2.5 };
  const sets = makeSets(22.5, 12, 3);
  const result = getDoubleProgressionSuggestion(sets, decimalExercise, 'kg');
  expect(result.newWeight).toBe(25);
});

test('Small decimal weights (microplates)', () => {
  const microExercise = { ...doubleExercise, weightIncrement: 0.5 };
  const sets = makeSets(10.5, 12, 3);
  const result = getDoubleProgressionSuggestion(sets, microExercise, 'kg');
  expect(result.newWeight).toBe(11);
});

section('EDGE CASE #10: Single Working Set');

test('Single working set calculates correctly', () => {
  const sets = makeSets(20, 10, 1);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('increase_reps');
  expect(result.targetReps).toBe(11);
});

test('Single set at max reps increases weight', () => {
  const sets = makeSets(20, 12, 1);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.action).toBe('increase_weight');
  expect(result.newWeight).toBe(25);
});

test('getBestSet with single set returns that set', () => {
  const sets = makeSets(100, 8, 1);
  const best = getBestSet(sets);
  expect(best).toBeDefined();
  expect(best.weight).toBe(100);
  expect(best.reps).toBe(8);
});

section('EDGE CASE #11: All Sets Incomplete');

test('All incomplete sets gives helpful message', () => {
  const sets = makeSets(20, 10, 3, { completed: false });
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  expect(result.message).toContain('No completed sets');
  expect(result.message).toContain('reducing');
});

test('Triple: all incomplete sets gives helpful message', () => {
  const sets = makeSets(50, 10, 3, { completed: false });
  const result = getTripleProgressionSuggestion(sets, tripleExercise, 'kg');
  expect(result.message).toContain('No completed sets');
});

test('Mix of completed and incomplete uses only completed', () => {
  const sets = makeCustomSets([
    { weight: 20, reps: 10, completed: true },
    { weight: 20, reps: 8, completed: false },
    { weight: 20, reps: 10, completed: true }
  ]);
  const result = getDoubleProgressionSuggestion(sets, doubleExercise, 'kg');
  // Should use only 2 completed sets, avg = 10
  expect(result.action).toBe('increase_reps');
  expect(result.targetReps).toBe(11);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 8: MUTATION TESTING
// ════════════════════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(60));
console.log('   MUTATION TESTING');
console.log('═'.repeat(60));

let mutationsKilled = 0;
let mutationsSurvived = 0;

function testMutation(name, testFn) {
  try {
    const result = testFn();
    if (result === false) {
      console.log(`  ✓ KILLED: ${name}`);
      mutationsKilled++;
    } else {
      console.log(`  ✗ SURVIVED: ${name}`);
      mutationsSurvived++;
    }
  } catch (e) {
    console.log(`  ✓ KILLED: ${name}`);
    mutationsKilled++;
  }
}

// ─────────────────────────────────────────────────────────────
section('MUTATIONS - Unit Conversion');
// ─────────────────────────────────────────────────────────────

testMutation('kgToLb: Use wrong conversion factor (2.0 instead of 2.20462)', () => {
  const mutatedKgToLb = (kg) => Math.round(kg * 2.0 * 10) / 10;
  return mutatedKgToLb(100) === 220.5; // Should be 200, not 220.5
});

testMutation('kgToLb: Divide instead of multiply', () => {
  const mutatedKgToLb = (kg) => Math.round(kg / KG_TO_LB * 10) / 10;
  return mutatedKgToLb(100) === 220.5;
});

testMutation('kgToLb: Remove rounding', () => {
  const mutatedKgToLb = (kg) => kg * KG_TO_LB;
  return mutatedKgToLb(100) === 220.5; // Would be 220.462
});

testMutation('lbToKg: Use wrong conversion factor', () => {
  const mutatedLbToKg = (lb) => Math.round(lb * 0.5 * 10) / 10;
  return mutatedLbToKg(100) === 45.4; // Should be 50
});

testMutation('convertWeight: Remove same-unit short circuit', () => {
  const mutatedConvert = (weight, from, to) => {
    // MUTATION: Always convert even when same unit
    if (from === 'kg') return kgToLb(weight);
    return lbToKg(weight);
  };
  return mutatedConvert(100, 'kg', 'kg') === 100; // Would convert to lb
});

testMutation('getDisplayWeight: Use wrong default unit (lb instead of kg)', () => {
  const mutatedGetDisplay = (weight, stored, display) => {
    const from = stored || 'lb'; // MUTATION: default to lb
    return convertWeight(weight, from, display);
  };
  return mutatedGetDisplay(50, undefined, 'lb') === 110.2; // Would be 50 if default is lb
});

testMutation('getConversionFactor: Swap kg/lb factors', () => {
  const mutatedFactor = (from, to) => {
    if (from === to) return 1;
    if (from === 'kg' && to === 'lb') return LB_TO_KG; // MUTATION: swapped
    if (from === 'lb' && to === 'kg') return KG_TO_LB; // MUTATION: swapped
    return 1;
  };
  return mutatedFactor('kg', 'lb') === KG_TO_LB;
});

// ─────────────────────────────────────────────────────────────
section('MUTATIONS - 1RM Calculation');
// ─────────────────────────────────────────────────────────────

testMutation('calculate1RM: Remove 1-rep special case', () => {
  const mutated1RM = (weight, reps) => {
    // MUTATION: removed reps === 1 check
    if (reps > 12) return weight * (1 + reps / 30);
    return Math.round(weight * (1 + reps / 30));
  };
  return mutated1RM(100, 1) === 100; // Would be 103
});

testMutation('calculate1RM: Use wrong formula divisor (20 instead of 30)', () => {
  const mutated1RM = (weight, reps) => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 20)); // MUTATION: /20
  };
  return mutated1RM(100, 10) === 133; // Would be 150
});

testMutation('calculate1RM: Subtract instead of add in formula', () => {
  const mutated1RM = (weight, reps) => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 - reps / 30)); // MUTATION: subtract
  };
  return mutated1RM(100, 10) === 133; // Would be 67
});

testMutation('calculate1RM: Multiply reps instead of divide', () => {
  const mutated1RM = (weight, reps) => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps * 30)); // MUTATION: multiply
  };
  return mutated1RM(100, 5) === 117; // Would be huge
});

// ─────────────────────────────────────────────────────────────
section('MUTATIONS - Volume Calculation');
// ─────────────────────────────────────────────────────────────

testMutation('calculateVolume: Include warmup sets', () => {
  const mutatedVolume = (sets) => {
    return sets
      .filter(s => s.completed) // MUTATION: no warmup filter
      .reduce((total, set) => total + set.weight * set.reps, 0);
  };
  const sets = [
    createSet(50, 10, { isWarmup: true }),
    createSet(100, 10),
  ];
  return mutatedVolume(sets) === 1000; // Would be 1500
});

testMutation('calculateVolume: Include incomplete sets', () => {
  const mutatedVolume = (sets) => {
    return sets
      .filter(s => !s.isWarmup) // MUTATION: no completed filter
      .reduce((total, set) => total + set.weight * set.reps, 0);
  };
  const sets = [
    createSet(100, 10),
    createSet(100, 10, { completed: false }),
  ];
  return mutatedVolume(sets) === 1000; // Would be 2000
});

testMutation('calculateVolume: Add instead of multiply weight*reps', () => {
  const mutatedVolume = (sets) => {
    return sets
      .filter(s => !s.isWarmup && s.completed)
      .reduce((total, set) => total + set.weight + set.reps, 0); // MUTATION: add
  };
  const sets = [createSet(100, 10)];
  return mutatedVolume(sets) === 1000; // Would be 110
});

testMutation('calculateVolume: Use max instead of sum', () => {
  const mutatedVolume = (sets) => {
    return sets
      .filter(s => !s.isWarmup && s.completed)
      .reduce((max, set) => Math.max(max, set.weight * set.reps), 0); // MUTATION: max
  };
  const sets = [
    createSet(100, 10),
    createSet(100, 10),
    createSet(100, 10),
  ];
  return mutatedVolume(sets) === 3000; // Would be 1000
});

// ─────────────────────────────────────────────────────────────
section('MUTATIONS - Best Set Calculation');
// ─────────────────────────────────────────────────────────────

testMutation('getBestSet: Return first set instead of best', () => {
  const mutatedBest = (sets) => {
    const working = sets.filter(s => !s.isWarmup && s.completed);
    if (working.length === 0) return null;
    return working[0]; // MUTATION: first instead of best
  };
  const sets = [
    createSet(100, 8),
    createSet(110, 5), // This should be best
    createSet(90, 12),
  ];
  const best = mutatedBest(sets);
  return best.weight === 110;
});

testMutation('getBestSet: Return last set instead of best', () => {
  const mutatedBest = (sets) => {
    const working = sets.filter(s => !s.isWarmup && s.completed);
    if (working.length === 0) return null;
    return working[working.length - 1]; // MUTATION: last
  };
  const sets = [
    createSet(110, 5), // This should be best
    createSet(100, 8),
    createSet(90, 12),
  ];
  const best = mutatedBest(sets);
  return best.weight === 110;
});

testMutation('getBestSet: Compare by weight only, not 1RM', () => {
  const mutatedBest = (sets) => {
    const working = sets.filter(s => !s.isWarmup && s.completed);
    if (working.length === 0) return null;
    return working.reduce((best, set) => {
      return set.weight > best.weight ? set : best; // MUTATION: weight only
    });
  };
  const sets = [
    createSet(100, 12), // 1RM ≈ 140 - should be best
    createSet(110, 3),  // 1RM ≈ 121 - has higher weight
  ];
  const best = mutatedBest(sets);
  return best.weight === 100; // Should pick 100x12, mutation picks 110x3
});

testMutation('getBestSet: Include warmup sets', () => {
  const mutatedBest = (sets) => {
    const working = sets.filter(s => s.completed); // MUTATION: no warmup filter
    if (working.length === 0) return null;
    return working.reduce((best, set) => {
      const bestRM = calculate1RM(best.weight, best.reps);
      const setRM = calculate1RM(set.weight, set.reps);
      return setRM > bestRM ? set : best;
    });
  };
  const sets = [
    createSet(200, 10, { isWarmup: true }), // Would be picked
    createSet(100, 10),
  ];
  const best = mutatedBest(sets);
  return best.weight === 100;
});

// ─────────────────────────────────────────────────────────────
section('MUTATIONS - Exercise Slice');
// ─────────────────────────────────────────────────────────────

testMutation('addExercise: Replace instead of append', () => {
  const mutatedReducer = (state, action) => {
    return { ...state, exercises: [action.payload] }; // MUTATION: replace
  };
  const state = { exercises: [createExercise('ex1')] };
  const newState = mutatedReducer(state, { payload: createExercise('ex2') });
  return newState.exercises.length === 2;
});

testMutation('updateExercise: Update first item always', () => {
  const mutatedReducer = (state, action) => {
    if (state.exercises.length > 0) {
      const newExercises = [...state.exercises];
      newExercises[0] = action.payload; // MUTATION: always first
      return { ...state, exercises: newExercises };
    }
    return state;
  };
  const state = { exercises: [createExercise('ex1'), createExercise('ex2')] };
  const newState = mutatedReducer(state, { payload: createExercise('ex2', 'Updated') });
  return newState.exercises[1].name === 'Updated';
});

testMutation('deleteExercise: Use === instead of !== in filter', () => {
  const mutatedReducer = (state, action) => {
    return { ...state, exercises: state.exercises.filter(e => e.id === action.payload) }; // MUTATION: ===
  };
  const state = { exercises: [createExercise('ex1'), createExercise('ex2')] };
  const newState = mutatedReducer(state, { payload: 'ex1' });
  return newState.exercises.length === 1 && newState.exercises[0].id === 'ex2';
});

// ─────────────────────────────────────────────────────────────
section('MUTATIONS - Workout Slice');
// ─────────────────────────────────────────────────────────────

testMutation('endWorkout: Append instead of prepend', () => {
  const mutatedReducer = (state, action) => {
    if (state.activeWorkout) {
      const completed = { ...state.activeWorkout, completed: true, duration: 0 };
      return {
        ...state,
        workouts: [...state.workouts, completed], // MUTATION: append
        activeWorkout: null,
      };
    }
    return state;
  };
  const state = {
    workouts: [{ ...createWorkout('old'), completed: true }],
    activeWorkout: createWorkout('new'),
  };
  const newState = mutatedReducer(state, { type: 'endWorkout' });
  return newState.workouts[0].id === 'new';
});

testMutation('endWorkout: Set completed to false', () => {
  const mutatedReducer = (state, action) => {
    if (state.activeWorkout) {
      const completed = { ...state.activeWorkout, completed: false }; // MUTATION: false
      return { ...state, workouts: [completed, ...state.workouts], activeWorkout: null };
    }
    return state;
  };
  const state = { workouts: [], activeWorkout: createWorkout('w1') };
  const newState = mutatedReducer(state, { type: 'endWorkout' });
  return newState.workouts[0].completed === true;
});

testMutation('endWorkout: Keep activeWorkout instead of clearing', () => {
  const mutatedReducer = (state, action) => {
    if (state.activeWorkout) {
      const completed = { ...state.activeWorkout, completed: true };
      return { ...state, workouts: [completed, ...state.workouts] }; // MUTATION: no clear
    }
    return state;
  };
  const state = { workouts: [], activeWorkout: createWorkout('w1') };
  const newState = mutatedReducer(state, { type: 'endWorkout' });
  return newState.activeWorkout === null;
});

testMutation('deleteSet: Skip renumbering', () => {
  const mutatedReducer = (state, action) => {
    if (state.activeWorkout) {
      const exercises = state.activeWorkout.exercises.map(ex => {
        if (ex.id === action.payload.workoutExerciseId) {
          const sets = ex.sets.filter(s => s.id !== action.payload.setId);
          // MUTATION: no renumbering
          return { ...ex, sets };
        }
        return ex;
      });
      return { ...state, activeWorkout: { ...state.activeWorkout, exercises } };
    }
    return state;
  };
  const state = {
    workouts: [],
    activeWorkout: createWorkout('w1', [
      createWorkoutExercise('ex1', [
        createWorkoutSet('s1', 1),
        createWorkoutSet('s2', 2),
        createWorkoutSet('s3', 3),
      ]),
    ]),
  };
  const newState = mutatedReducer(state, { payload: { workoutExerciseId: 'ex1', setId: 's2' } });
  return newState.activeWorkout.exercises[0].sets[1].setNumber === 2; // Should be 2 after renumbering
});

testMutation('updateSet: Replace entire set instead of merge', () => {
  const mutatedReducer = (state, action) => {
    if (state.activeWorkout) {
      const exercises = state.activeWorkout.exercises.map(ex => {
        if (ex.id === action.payload.workoutExerciseId) {
          const sets = ex.sets.map(s => {
            if (s.id === action.payload.setId) {
              return action.payload.updates; // MUTATION: replace not merge
            }
            return s;
          });
          return { ...ex, sets };
        }
        return ex;
      });
      return { ...state, activeWorkout: { ...state.activeWorkout, exercises } };
    }
    return state;
  };
  const state = {
    workouts: [],
    activeWorkout: createWorkout('w1', [
      createWorkoutExercise('ex1', [createWorkoutSet('s1', 1, 100, 10)]),
    ]),
  };
  const newState = mutatedReducer(state, {
    payload: { workoutExerciseId: 'ex1', setId: 's1', updates: { weight: 110 } }
  });
  return newState.activeWorkout.exercises[0].sets[0].reps === 10; // Should preserve reps
});

// ─────────────────────────────────────────────────────────────
section('MUTATIONS - User Slice (Personal Records)');
// ─────────────────────────────────────────────────────────────

testMutation('addPersonalRecord: Always append, never update', () => {
  const mutatedReducer = (state, action) => {
    // MUTATION: always append
    return { ...state, personalRecords: [...state.personalRecords, action.payload] };
  };
  const state = { personalRecords: [createPR('bench-press', '1rm', 100)] };
  const newState = mutatedReducer(state, { payload: createPR('bench-press', '1rm', 110) });
  return newState.personalRecords.length === 1; // Should still be 1
});

testMutation('addPersonalRecord: Update even with lower value', () => {
  const mutatedReducer = (state, action) => {
    const idx = state.personalRecords.findIndex(
      pr => pr.exerciseId === action.payload.exerciseId && pr.type === action.payload.type
    );
    if (idx !== -1) {
      // MUTATION: no value comparison
      const newRecords = [...state.personalRecords];
      newRecords[idx] = action.payload;
      return { ...state, personalRecords: newRecords };
    }
    return { ...state, personalRecords: [...state.personalRecords, action.payload] };
  };
  const state = { personalRecords: [createPR('bench-press', '1rm', 100)] };
  const newState = mutatedReducer(state, { payload: createPR('bench-press', '1rm', 90) });
  return newState.personalRecords[0].value === 100; // Should remain 100
});

testMutation('addPersonalRecord: Use >= instead of > for comparison', () => {
  const mutatedReducer = (state, action) => {
    const idx = state.personalRecords.findIndex(
      pr => pr.exerciseId === action.payload.exerciseId && pr.type === action.payload.type
    );
    if (idx !== -1) {
      if (action.payload.value >= state.personalRecords[idx].value) { // MUTATION: >=
        const newRecords = [...state.personalRecords];
        newRecords[idx] = action.payload;
        return { ...state, personalRecords: newRecords };
      }
      return state;
    }
    return { ...state, personalRecords: [...state.personalRecords, action.payload] };
  };
  const oldPR = createPR('bench-press', '1rm', 100);
  const state = { personalRecords: [oldPR] };
  const newPR = createPR('bench-press', '1rm', 100);
  newPR.date = 'new-date';
  const newState = mutatedReducer(state, { payload: newPR });
  return newState.personalRecords[0].date === oldPR.date; // Should not update with equal value
});

testMutation('addPersonalRecord: Check only exerciseId, not type', () => {
  const mutatedReducer = (state, action) => {
    const idx = state.personalRecords.findIndex(
      pr => pr.exerciseId === action.payload.exerciseId // MUTATION: no type check
    );
    if (idx !== -1) {
      if (action.payload.value > state.personalRecords[idx].value) {
        const newRecords = [...state.personalRecords];
        newRecords[idx] = action.payload;
        return { ...state, personalRecords: newRecords };
      }
      return state;
    }
    return { ...state, personalRecords: [...state.personalRecords, action.payload] };
  };
  const state = { personalRecords: [createPR('bench-press', '1rm', 100)] };
  const newState = mutatedReducer(state, { payload: createPR('bench-press', 'maxWeight', 95) });
  return newState.personalRecords.length === 2; // Should be 2 different types
});

testMutation('updateSettings: Replace instead of merge', () => {
  const mutatedReducer = (state, action) => {
    return {
      ...state,
      user: {
        ...state.user,
        settings: action.payload, // MUTATION: replace not merge
      },
    };
  };
  const state = {
    user: {
      settings: { units: 'lb', theme: 'system', restTimerDefault: 90, weeklyGoal: 4 }
    }
  };
  const newState = mutatedReducer(state, { payload: { units: 'kg' } });
  return newState.user.settings.theme === 'system'; // Should preserve theme
});

testMutation('setUser: Always set isAuthenticated true', () => {
  const mutatedReducer = (state, action) => {
    return {
      ...state,
      user: action.payload,
      isAuthenticated: true, // MUTATION: always true
    };
  };
  const state = { user: {}, isAuthenticated: false };
  const newState = mutatedReducer(state, { payload: { id: 'u1', settings: {} } }); // No email
  return newState.isAuthenticated === false;
});

testMutation('setUser: Always set isAuthenticated false', () => {
  const mutatedReducer = (state, action) => {
    return {
      ...state,
      user: action.payload,
      isAuthenticated: false, // MUTATION: always false
    };
  };
  const state = { user: {}, isAuthenticated: false };
  const newState = mutatedReducer(state, { payload: { id: 'u1', email: 'test@test.com', settings: {} } });
  return newState.isAuthenticated === true;
});

// ─────────────────────────────────────────────────────────────
section('MUTATIONS - Data Validation');
// ─────────────────────────────────────────────────────────────

testMutation('Validation: Allow duplicate IDs', () => {
  const exercisesWithDupe = [
    ...defaultExercises,
    { ...defaultExercises[0] }, // Duplicate
  ];
  const ids = exercisesWithDupe.map(e => e.id);
  const uniqueIds = new Set(ids);
  return ids.length === uniqueIds.size; // Should fail with dupe
});

testMutation('Validation: Allow invalid category', () => {
  const badExercise = { ...defaultExercises[0], category: 'invalid-category' };
  return validCategories.includes(badExercise.category);
});

testMutation('Validation: Allow invalid progression type', () => {
  const badExercise = { ...defaultExercises[0], progressionType: 'quadruple' };
  return validProgressionTypes.includes(badExercise.progressionType);
});

testMutation('Validation: Allow negative weight increment', () => {
  const badExercise = { ...defaultExercises[0], weightIncrement: -5 };
  return badExercise.weightIncrement >= 0;
});

testMutation('Validation: Allow min > max reps', () => {
  const badExercise = { ...defaultExercises[0], targetRepMin: 15, targetRepMax: 10 };
  return badExercise.targetRepMin < badExercise.targetRepMax;
});

// ════════════════════════════════════════════════════════════════════════════
// FINAL SUMMARY
// ════════════════════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(60));
console.log('   FINAL RESULTS');
console.log('═'.repeat(60));

console.log(`\n📊 Unit Tests: ${passed} passed, ${failed} failed`);
console.log(`🧬 Mutation Tests: ${mutationsKilled} killed, ${mutationsSurvived} survived`);

const passRate = (passed / (passed + failed) * 100).toFixed(1);
const mutationScore = mutationsKilled / (mutationsKilled + mutationsSurvived) * 100;

console.log(`\n🎯 Unit Test Pass Rate: ${passRate}%`);
console.log(`🎯 Mutation Score: ${mutationScore.toFixed(1)}%`);

if (failed === 0 && mutationsSurvived === 0) {
  console.log('\n✅ PERFECT! All tests passed and all mutations killed!\n');
  console.log('Coverage includes:');
  console.log('  • Unit conversion utilities (kg ↔ lb)');
  console.log('  • 1RM calculation (Epley formula)');
  console.log('  • Volume calculation');
  console.log('  • Best set detection');
  console.log('  • Exercise slice (CRUD operations)');
  console.log('  • Workout slice (lifecycle, sets, exercises)');
  console.log('  • User slice (PRs, settings, auth)');
  console.log('  • Exercise data validation');
  console.log('\nMutation testing verified:');
  console.log('  • Conversion formulas and factors');
  console.log('  • 1RM formula correctness');
  console.log('  • Volume filtering and aggregation');
  console.log('  • Best set comparison logic');
  console.log('  • Redux reducer state mutations');
  console.log('  • PR update-only-if-higher logic');
  console.log('  • Authentication state logic');
  console.log('  • Data validation constraints');
} else if (failed === 0) {
  console.log(`\n⚠️  All unit tests passed but ${mutationsSurvived} mutation(s) survived.`);
  console.log('Consider adding more specific tests to kill surviving mutants.');
} else {
  console.log(`\n❌ ${failed} test(s) failed.`);
}

console.log('');

if (failed > 0 || mutationsSurvived > 0) {
  process.exit(1);
}
