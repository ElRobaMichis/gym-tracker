import { Exercise, WorkoutSet, ProgressionSuggestion } from '../types';

/**
 * Round weight to avoid floating point precision issues
 */
function roundWeight(weight: number, precision: number = 0.5): number {
  return Math.round(weight / precision) * precision;
}

/**
 * Validate set data and return invalid sets
 */
function getInvalidSets(sets: WorkoutSet[]): WorkoutSet[] {
  return sets.filter(s =>
    !Number.isFinite(s.weight) || s.weight < 0 ||
    !Number.isFinite(s.reps) || s.reps < 0
  );
}

/**
 * Get the most common weight from a set of working sets
 * If tied, returns the highest weight
 */
function getMostCommonWeight(workingSets: WorkoutSet[]): number {
  const weights = [...new Set(workingSets.map(s => s.weight))];
  if (weights.length === 1) return weights[0];

  const weightCounts = weights.map(w => ({
    weight: w,
    count: workingSets.filter(s => s.weight === w).length
  }));
  weightCounts.sort((a, b) => b.count - a.count || b.weight - a.weight);
  return weightCounts[0].weight;
}

/**
 * Double Progression Algorithm
 * Used for exercises where weight can be increased in small increments (barbells, some machines)
 *
 * Logic:
 * 1. Keep weight constant
 * 2. Increase reps each session until hitting target max reps on all sets
 * 3. When all sets hit target max reps → increase weight, reset to target min reps
 *
 * Example: 100kg x 8,8,8 → 100kg x 10,10,10 → 100kg x 12,12,12 → 105kg x 8,8,8
 */
export function getDoubleProgressionSuggestion(
  lastSets: WorkoutSet[],
  exercise: Exercise,
  units: 'kg' | 'lb' = 'kg'
): ProgressionSuggestion {
  const { targetRepMin, targetRepMax, weightIncrement } = exercise;

  // Edge case #11: Check if all sets are incomplete (no completed working sets)
  const allSets = lastSets.filter(s => !s.isWarmup);
  const workingSets = lastSets.filter(s => !s.isWarmup && s.completed);

  if (workingSets.length === 0) {
    // Check if there were incomplete sets
    if (allSets.length > 0) {
      return {
        action: 'maintain',
        message: 'No completed sets. Consider reducing the weight or taking more rest between sets',
      };
    }
    return {
      action: 'maintain',
      message: 'Start with a weight you can do for ' + targetRepMin + ' reps',
    };
  }

  // Edge case #2 & #6: Validate for negative/NaN values
  const invalidSets = getInvalidSets(workingSets);
  if (invalidSets.length > 0) {
    return {
      action: 'maintain',
      message: 'Invalid set data detected. Please check your logged weights and reps',
    };
  }

  // Edge case #1: Handle mixed weights - use most common weight
  const lastWeight = getMostCommonWeight(workingSets);

  const avgReps = Math.round(
    workingSets.reduce((sum, s) => sum + s.reps, 0) / workingSets.length
  );

  // Check if user is struggling at current weight (less than half of target min)
  if (avgReps < targetRepMin / 2) {
    const reducedWeight = Math.max(0, lastWeight - weightIncrement);
    if (reducedWeight === 0 && lastWeight === 0) {
      return {
        action: 'maintain',
        newWeight: 0,
        targetReps: targetRepMin,
        message: `Try a lighter variation or focus on form with bodyweight`,
      };
    }
    return {
      action: 'reduce_weight',
      newWeight: reducedWeight,
      targetReps: targetRepMin,
      message: `Weight too heavy (only ${avgReps} reps avg). Reduce to ${reducedWeight}${units} and aim for ${targetRepMin} reps`,
    };
  }

  const allHitMaxReps = workingSets.every(s => s.reps >= targetRepMax);

  // Check for excessive sets (more than target max)
  const { targetSetsMax = 4, targetSetsMin = 3 } = exercise;
  if (workingSets.length > targetSetsMax) {
    return {
      action: 'maintain',
      newWeight: lastWeight,
      targetReps: avgReps,
      message: `Too many sets (${workingSets.length}). Reduce to ${targetSetsMax} sets at ${lastWeight}${units} for better recovery`,
    };
  }

  if (allHitMaxReps) {
    // Edge case #4: If reps are way above target max, suggest bigger weight increase
    if (avgReps > targetRepMax * 1.5 && weightIncrement > 0) {
      const aggressiveIncrement = weightIncrement * 2;
      const newWeight = roundWeight(lastWeight + aggressiveIncrement);
      return {
        action: 'increase_weight',
        newWeight,
        newReps: targetRepMin,
        message: `Crushing it (${avgReps} reps avg)! Jump to ${newWeight}${units} and aim for ${targetRepMin} reps`,
      };
    }

    // Edge case #5 & #8: Round weight and handle 0 increment
    const newWeight = weightIncrement > 0
      ? roundWeight(lastWeight + weightIncrement)
      : lastWeight;

    // Edge case #8: If weight increment is 0, just maintain
    if (weightIncrement === 0) {
      return {
        action: 'maintain',
        newWeight: lastWeight,
        targetReps: targetRepMax,
        message: `Great form! Keep at ${lastWeight}${units} for ${targetRepMax} reps (bodyweight exercise)`,
      };
    }

    return {
      action: 'increase_weight',
      newWeight,
      newReps: targetRepMin,
      message: `All sets hit ${targetRepMax} reps! Increase weight to ${newWeight}${units} and aim for ${targetRepMin} reps`,
    };
  }

  const targetReps = Math.min(avgReps + 1, targetRepMax);

  return {
    action: 'increase_reps',
    newWeight: lastWeight,
    targetReps,
    message: `Keep weight at ${lastWeight}${units} and aim for ${targetReps} reps per set`,
  };
}

/**
 * Triple Progression Algorithm
 * Used for exercises where weight jumps are large (cable machines, dumbbells)
 *
 * Logic:
 * 1. Progress reps first (within target rep range)
 * 2. Then add sets (within target set range)
 * 3. Then increase weight and reset reps/sets
 *
 * Example:
 * 50kg x 2 sets x 8 reps
 * 50kg x 2 sets x 10 reps
 * 50kg x 2 sets x 12 reps
 * 50kg x 3 sets x 8 reps
 * 50kg x 3 sets x 10 reps
 * 50kg x 3 sets x 12 reps
 * 60kg x 2 sets x 8 reps (weight increase, reset everything)
 */
export function getTripleProgressionSuggestion(
  lastSets: WorkoutSet[],
  exercise: Exercise,
  units: 'kg' | 'lb' = 'kg'
): ProgressionSuggestion {
  const {
    targetRepMin,
    targetRepMax,
    targetSetsMin,
    targetSetsMax,
    weightIncrement,
  } = exercise;

  // Edge case #11: Check if all sets are incomplete
  const allSets = lastSets.filter(s => !s.isWarmup);
  const workingSets = lastSets.filter(s => !s.isWarmup && s.completed);

  if (workingSets.length === 0) {
    // Check if there were incomplete sets
    if (allSets.length > 0) {
      return {
        action: 'maintain',
        newSets: targetSetsMin,
        newReps: targetRepMin,
        message: 'No completed sets. Consider reducing the weight or taking more rest between sets',
      };
    }
    return {
      action: 'maintain',
      newSets: targetSetsMin,
      newReps: targetRepMin,
      message: `Start with ${targetSetsMin} sets of ${targetRepMin} reps at a challenging weight`,
    };
  }

  // Edge case #2 & #6: Validate for negative/NaN values
  const invalidSets = getInvalidSets(workingSets);
  if (invalidSets.length > 0) {
    return {
      action: 'maintain',
      newSets: targetSetsMin,
      message: 'Invalid set data detected. Please check your logged weights and reps',
    };
  }

  // Edge case #1: Handle mixed weights - use most common weight
  const lastWeight = getMostCommonWeight(workingSets);
  const currentSetCount = workingSets.length;
  const avgReps = Math.round(
    workingSets.reduce((sum, s) => sum + s.reps, 0) / workingSets.length
  );

  // Check if user is struggling at current weight (less than half of target min)
  if (avgReps < targetRepMin / 2) {
    const reducedWeight = Math.max(0, lastWeight - weightIncrement);
    if (reducedWeight === 0 && lastWeight === 0) {
      return {
        action: 'maintain',
        newSets: targetSetsMin,
        targetReps: targetRepMin,
        message: `Try a lighter variation or focus on form`,
      };
    }
    return {
      action: 'reduce_weight',
      newWeight: reducedWeight,
      newSets: targetSetsMin,
      targetReps: targetRepMin,
      message: `Weight too heavy. Reduce to ${reducedWeight}${units}, ${targetSetsMin} sets of ${targetRepMin} reps`,
    };
  }

  const allHitMaxReps = workingSets.every(s => s.reps >= targetRepMax);

  // Check for excessive sets (more than target max)
  if (currentSetCount > targetSetsMax) {
    return {
      action: 'maintain',
      newWeight: lastWeight,
      newSets: targetSetsMax,
      targetReps: avgReps,
      message: `Too many sets (${currentSetCount}). Reduce to ${targetSetsMax} sets at ${lastWeight}${units} for better recovery`,
    };
  }

  // Step 1: Check if all sets hit max reps
  if (allHitMaxReps) {
    // Step 2: Check if we can add more sets
    if (currentSetCount < targetSetsMax) {
      const newSetCount = currentSetCount + 1;
      return {
        action: 'add_set',
        newWeight: lastWeight,
        newSets: newSetCount,
        newReps: targetRepMin,
        message: `Great job hitting ${targetRepMax} reps on all sets! Add a set (${newSetCount} total) and drop back to ${targetRepMin} reps`,
      };
    } else {
      // Edge case #4: If reps are way above target max, suggest bigger weight increase
      if (avgReps > targetRepMax * 1.5 && weightIncrement > 0) {
        const aggressiveIncrement = weightIncrement * 2;
        const newWeight = roundWeight(lastWeight + aggressiveIncrement);
        return {
          action: 'increase_weight',
          newWeight,
          newSets: targetSetsMin,
          newReps: targetRepMin,
          message: `Crushing it (${avgReps} reps avg)! Jump to ${newWeight}${units}, ${targetSetsMin} sets of ${targetRepMin} reps`,
        };
      }

      // Edge case #8: If weight increment is 0, maintain at max sets/reps
      if (weightIncrement === 0) {
        return {
          action: 'maintain',
          newWeight: lastWeight,
          newSets: targetSetsMax,
          targetReps: targetRepMax,
          message: `Great form! Keep at ${lastWeight}${units} for ${targetSetsMax} sets of ${targetRepMax} reps (bodyweight exercise)`,
        };
      }

      // Step 3: Increase weight and reset (with rounding)
      const newWeight = roundWeight(lastWeight + weightIncrement);
      return {
        action: 'increase_weight',
        newWeight,
        newSets: targetSetsMin,
        newReps: targetRepMin,
        message: `Maxed out! Increase weight to ${newWeight}${units}, reset to ${targetSetsMin} sets of ${targetRepMin} reps`,
      };
    }
  }

  // Still working on reps
  const targetReps = Math.min(avgReps + 1, targetRepMax);
  return {
    action: 'increase_reps',
    newWeight: lastWeight,
    newSets: currentSetCount,
    targetReps,
    message: `Keep weight at ${lastWeight}${units} with ${currentSetCount} sets, aim for ${targetReps} reps`,
  };
}

/**
 * Get progression suggestion based on exercise type
 */
export function getProgressionSuggestion(
  lastSets: WorkoutSet[],
  exercise: Exercise,
  units: 'kg' | 'lb' = 'kg'
): ProgressionSuggestion {
  if (exercise.progressionType === 'triple') {
    return getTripleProgressionSuggestion(lastSets, exercise, units);
  }
  return getDoubleProgressionSuggestion(lastSets, exercise, units);
}

/**
 * Calculate estimated 1RM using Epley formula
 * Edge case #3: Caps the multiplier for very high reps to avoid wild estimates
 * Edge case #2 & #6: Returns 0 for invalid inputs
 */
export function calculate1RM(weight: number, reps: number): number {
  // Edge case #2 & #6: Validate inputs
  if (!Number.isFinite(weight) || !Number.isFinite(reps)) return 0;
  if (weight < 0 || reps < 0) return 0;
  if (reps === 0) return 0;
  if (reps === 1) return weight;

  // Edge case #3: Cap the multiplier at 1.0 (2x weight max) for very high reps
  // Formula becomes inaccurate beyond ~30 reps
  const multiplier = Math.min(reps / 30, 1);
  return Math.round(weight * (1 + multiplier));
}

/**
 * Calculate total volume (weight × reps × sets)
 */
export function calculateVolume(sets: WorkoutSet[]): number {
  return sets
    .filter(s => !s.isWarmup && s.completed)
    .reduce((total, set) => total + set.weight * set.reps, 0);
}

/**
 * Get the best set from a collection (highest estimated 1RM)
 */
export function getBestSet(sets: WorkoutSet[]): WorkoutSet | null {
  const workingSets = sets.filter(s => !s.isWarmup && s.completed);
  if (workingSets.length === 0) return null;

  return workingSets.reduce((best, set) => {
    const bestRM = calculate1RM(best.weight, best.reps);
    const setRM = calculate1RM(set.weight, set.reps);
    return setRM > bestRM ? set : best;
  });
}
