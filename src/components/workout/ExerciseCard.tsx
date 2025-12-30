import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, Flame, Trash2, TrendingUp } from 'lucide-react-native';
import { v4 as uuidv4 } from 'uuid';
import { WorkoutExercise, Exercise, WorkoutSet } from '../../types';
import { SetRow } from './SetRow';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge, ProgressionBadge } from '../common/Badge';
import { IconButton } from '../common/IconButton';
import { MiniProgressRing } from '../common/ProgressRing';
import { useTheme } from '../../hooks/useTheme';
import { getProgressionSuggestion } from '../../services/progression';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from '../../constants/theme';
import { springConfig } from '../../utils/animations';
import { getDisplayWeight } from '../../utils/unitConversion';

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  previousSets?: WorkoutSet[];
  onUpdateSet: (setId: string, updates: Partial<WorkoutSet>) => void;
  onDeleteSet: (setId: string) => void;
  onAddSet: (set: WorkoutSet) => void;
  onRemoveExercise: () => void;
  units: 'kg' | 'lb';
  index?: number;
}

export function ExerciseCard({
  workoutExercise,
  exercise,
  previousSets,
  onUpdateSet,
  onDeleteSet,
  onAddSet,
  onRemoveExercise,
  units,
  index = 0,
}: ExerciseCardProps) {
  const { colors, isDark, glows } = useTheme();

  // Animation values
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const suggestionOpacity = useRef(new Animated.Value(0)).current;
  const suggestionTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // Entrance animation with stagger
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          ...springConfig.default,
        }),
      ]),
    ]).start();
  }, [index]);

  const suggestion = previousSets?.length
    ? getProgressionSuggestion(previousSets, exercise, units)
    : null;

  useEffect(() => {
    if (suggestion) {
      Animated.parallel([
        Animated.timing(suggestionOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(suggestionTranslateY, {
          toValue: 0,
          ...springConfig.default,
        }),
      ]).start();
    }
  }, [suggestion]);

  const warmupSets = workoutExercise.sets.filter(s => s.isWarmup);
  const workingSets = workoutExercise.sets.filter(s => !s.isWarmup);
  const completedSets = workingSets.filter(s => s.completed).length;
  const totalSets = workingSets.length;
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  const handleAddSet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const lastSet = workoutExercise.sets[workoutExercise.sets.length - 1];

    // Get the weight in current display unit
    let defaultWeight = 0;
    if (lastSet) {
      defaultWeight = getDisplayWeight(lastSet.weight, lastSet.weightUnit, units);
    } else if (suggestion?.newWeight) {
      defaultWeight = suggestion.newWeight;
    }

    const newSet: WorkoutSet = {
      id: uuidv4(),
      workoutExerciseId: workoutExercise.id,
      setNumber: workingSets.length + 1,
      weight: defaultWeight,
      weightUnit: units,
      reps: lastSet?.reps || suggestion?.targetReps || exercise.targetRepMin,
      isWarmup: false,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    onAddSet(newSet);
  }, [workoutExercise, suggestion, exercise, onAddSet, workingSets.length, units]);

  const handleAddWarmup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const firstWorkingSet = workoutExercise.sets.find(s => !s.isWarmup);

    let warmupWeight = 0;
    if (firstWorkingSet) {
      const workingWeight = getDisplayWeight(firstWorkingSet.weight, firstWorkingSet.weightUnit, units);
      warmupWeight = Math.round(workingWeight * 0.5);
    }

    const newSet: WorkoutSet = {
      id: uuidv4(),
      workoutExerciseId: workoutExercise.id,
      setNumber: 0,
      weight: warmupWeight,
      weightUnit: units,
      reps: 10,
      isWarmup: true,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    onAddSet(newSet);
  }, [workoutExercise, onAddSet, units]);

  const handleRemove = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemoveExercise();
  }, [onRemoveExercise]);

  const isExerciseComplete = totalSets > 0 && completedSets === totalSets;

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: translateYAnim }],
      }}
    >
      <Card
        variant="elevated"
        glowing={isExerciseComplete ? 'secondary' : false}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={[styles.exerciseName, { color: colors.text }]}>
                {exercise.name}
              </Text>
              <View style={styles.badges}>
                <ProgressionBadge
                  type={exercise.progressionType}
                  style={styles.badge}
                />
                {isExerciseComplete && (
                  <Badge
                    label="Complete"
                    variant="success"
                    size="sm"
                    style={styles.badge}
                  />
                )}
              </View>
            </View>
            <View style={styles.headerRight}>
              {totalSets > 0 && (
                <MiniProgressRing
                  progress={progress}
                  size={28}
                  color={isExerciseComplete ? 'secondary' : 'primary'}
                />
              )}
              <IconButton
                icon={<Trash2 size={18} color={colors.error} />}
                onPress={handleRemove}
                variant="ghost"
                size="sm"
                style={styles.removeButton}
              />
            </View>
          </View>
        </View>

        {/* Progression Suggestion */}
        {suggestion && (
          <Animated.View
            style={[
              styles.suggestionBox,
              {
                backgroundColor: colors.secondaryMuted,
                borderColor: colors.secondary,
                opacity: suggestionOpacity,
                transform: [{ translateY: suggestionTranslateY }],
              },
            ]}
          >
            <TrendingUp size={16} color={colors.secondary} strokeWidth={2.5} />
            <Text style={[styles.suggestionText, { color: colors.text }]}>
              {suggestion.message}
            </Text>
          </Animated.View>
        )}

        {/* Set Headers */}
        <View style={styles.setHeaders}>
          <Text
            style={[styles.headerText, styles.setCol, { color: colors.textTertiary }]}
          >
            Set
          </Text>
          <Text
            style={[styles.headerText, styles.prevCol, { color: colors.textTertiary }]}
          >
            Prev
          </Text>
          <Text
            style={[styles.headerText, styles.inputCol, { color: colors.textTertiary }]}
          >
            {units}
          </Text>
          <Text
            style={[styles.headerText, styles.inputCol, { color: colors.textTertiary }]}
          >
            Reps
          </Text>
          <View style={styles.actionsCol} />
        </View>

        {/* Warmup Sets */}
        {warmupSets.map((set, idx) => (
          <SetRow
            key={set.id}
            set={set}
            onUpdate={(updates) => onUpdateSet(set.id, updates)}
            onDelete={() => onDeleteSet(set.id)}
            units={units}
            index={idx}
          />
        ))}

        {/* Working Sets */}
        {workingSets.map((set, idx) => {
          const prevSet = previousSets?.[idx];
          const convertedPrevWeight = prevSet
            ? getDisplayWeight(prevSet.weight, prevSet.weightUnit, units)
            : 0;

          return (
            <SetRow
              key={set.id}
              set={set}
              previousSet={
                prevSet
                  ? {
                      weight: convertedPrevWeight,
                      reps: prevSet.reps,
                    }
                  : undefined
              }
              onUpdate={(updates) => onUpdateSet(set.id, updates)}
              onDelete={() => onDeleteSet(set.id)}
              units={units}
              index={warmupSets.length + idx}
            />
          );
        })}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Add Set"
            onPress={handleAddSet}
            variant="outline"
            size="sm"
            icon={<Plus size={16} color={colors.primary} strokeWidth={2.5} />}
            style={styles.addButton}
          />
          <Button
            title="Warmup"
            onPress={handleAddWarmup}
            variant="ghost"
            size="sm"
            icon={<Flame size={16} color={colors.textSecondary} strokeWidth={2.5} />}
            style={styles.addButton}
          />
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    marginRight: spacing.xs,
    marginTop: spacing.xxs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  removeButton: {
    marginLeft: spacing.xs,
  },
  suggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  suggestionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  setHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    marginBottom: spacing.xs,
  },
  headerText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setCol: {
    width: 32,
    textAlign: 'center',
  },
  prevCol: {
    width: 56,
    textAlign: 'center',
  },
  inputCol: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.xs,
  },
  actionsCol: {
    width: 110,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  addButton: {
    marginRight: spacing.sm,
  },
});
