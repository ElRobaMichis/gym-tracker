import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Play,
  FolderHeart,
  Dumbbell,
  Layers,
  Clock,
  Trash2,
  MoreVertical,
} from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/useStore';
import { startWorkout } from '../../store/slices/workoutSlice';
import { deleteRoutine, markRoutineUsed } from '../../store/slices/routineSlice';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Routine, Workout, WorkoutExercise, WorkoutSet } from '../../types';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from '../../constants/theme';
import { v4 as uuidv4 } from 'uuid';

type RootStackParamList = {
  MainTabs: undefined;
  ActiveWorkout: undefined;
  RoutineDetail: { routineId: string };
};

// Routine color palette
const ROUTINE_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export function RoutinesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();
  const { routines } = useAppSelector(state => state.routines);
  const { exercises: allExercises } = useAppSelector(state => state.exercises);
  const { user } = useAppSelector(state => state.user);
  const { activeWorkout } = useAppSelector(state => state.workouts);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const emptyStateOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header fade in
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Empty state fade in
    if (routines.length === 0) {
      Animated.timing(emptyStateOpacity, {
        toValue: 1,
        delay: 200,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  const getExerciseName = (exerciseId: string) => {
    const exercise = allExercises.find(e => e.id === exerciseId);
    return exercise?.name || 'Unknown Exercise';
  };

  const handleStartFromRoutine = useCallback((routine: Routine) => {
    if (activeWorkout) {
      Alert.alert(
        'Workout in Progress',
        'You have an active workout. Do you want to discard it and start a new one from this routine?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard & Start',
            style: 'destructive',
            onPress: () => startWorkoutFromRoutine(routine),
          },
        ]
      );
      return;
    }
    startWorkoutFromRoutine(routine);
  }, [activeWorkout, user.id, dispatch, navigation]);

  const startWorkoutFromRoutine = (routine: Routine) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Create workout exercises from routine exercises
    const workoutExercises: WorkoutExercise[] = routine.exercises.map((re, index) => {
      const sets: WorkoutSet[] = [];
      for (let i = 0; i < re.targetSets; i++) {
        sets.push({
          id: uuidv4(),
          workoutExerciseId: '', // Will be set below
          setNumber: i + 1,
          weight: re.targetWeight || 0,
          weightUnit: re.targetWeightUnit || user.settings.units,
          reps: re.targetReps,
          isWarmup: false,
          completed: false,
          createdAt: new Date().toISOString(),
        });
      }

      const workoutExerciseId = uuidv4();
      // Update set references
      sets.forEach(set => {
        set.workoutExerciseId = workoutExerciseId;
      });

      return {
        id: workoutExerciseId,
        workoutId: '', // Will be set below
        exerciseId: re.exerciseId,
        orderIndex: index,
        notes: re.notes,
        sets,
      };
    });

    const workoutId = uuidv4();
    // Update exercise references
    workoutExercises.forEach(ex => {
      ex.workoutId = workoutId;
    });

    const newWorkout: Workout = {
      id: workoutId,
      userId: user.id,
      name: routine.name,
      date: new Date().toISOString(),
      completed: false,
      exercises: workoutExercises,
      createdAt: new Date().toISOString(),
    };

    dispatch(markRoutineUsed(routine.id));
    dispatch(startWorkout(newWorkout));
    navigation.navigate('ActiveWorkout');
  };

  const handleDeleteRoutine = useCallback((routine: Routine) => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routine.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            dispatch(deleteRoutine(routine.id));
          },
        },
      ]
    );
  }, [dispatch]);

  const formatLastUsed = (dateString?: string) => {
    if (!dateString) return 'Never used';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Used today';
    if (diffDays === 1) return 'Used yesterday';
    if (diffDays < 7) return `Used ${diffDays} days ago`;
    if (diffDays < 30) return `Used ${Math.floor(diffDays / 7)} weeks ago`;
    return `Used ${Math.floor(diffDays / 30)} months ago`;
  };

  const renderRoutineItem = useCallback(
    ({ item, index }: { item: Routine; index: number }) => {
      const routineColor = item.color || ROUTINE_COLORS[index % ROUTINE_COLORS.length];

      return (
        <Card
          variant="elevated"
          pressable
          haptic
          animated
          animationDelay={index * 50}
          style={styles.routineCard}
          onPress={() => handleStartFromRoutine(item)}
        >
          <LinearGradient
            colors={[`${routineColor}20`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.xl - 1 }]}
          />

          <View style={styles.routineHeader}>
            <View style={styles.routineTitleRow}>
              <View style={styles.routineNameContainer}>
                <View style={[styles.routineIndicator, { backgroundColor: routineColor }]} />
                <Text style={[styles.routineName, { color: colors.text }]}>
                  {item.name}
                </Text>
              </View>
              <View style={styles.routineActions}>
                <Badge
                  label={`${item.timesUsed} uses`}
                  variant="neutral"
                  size="sm"
                />
              </View>
            </View>
            {item.description && (
              <Text
                style={[styles.routineDescription, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </View>

          <View style={styles.exercisePreview}>
            {item.exercises.slice(0, 3).map((re, i) => (
              <Text
                key={re.id}
                style={[styles.exercisePreviewText, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {getExerciseName(re.exerciseId)}
              </Text>
            ))}
            {item.exercises.length > 3 && (
              <Text style={[styles.moreExercises, { color: colors.textTertiary }]}>
                +{item.exercises.length - 3} more
              </Text>
            )}
          </View>

          <View style={styles.routineStats}>
            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Dumbbell size={14} color={routineColor} strokeWidth={2.5} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {item.exercises.length}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                Exercises
              </Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Layers size={14} color={colors.secondary} strokeWidth={2.5} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {item.exercises.reduce((sum, e) => sum + e.targetSets, 0)}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                Sets
              </Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Clock size={14} color={colors.textSecondary} strokeWidth={2.5} />
                <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
                  {formatLastUsed(item.lastUsed).replace('Used ', '')}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                Last Used
              </Text>
            </View>
          </View>

          <View style={styles.routineFooter}>
            <Button
              title="Start Workout"
              onPress={() => handleStartFromRoutine(item)}
              variant="primary"
              size="sm"
              icon={<Play size={14} color="#FFFFFF" fill="#FFFFFF" />}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <Button
              title=""
              onPress={() => handleDeleteRoutine(item)}
              variant="ghost"
              size="sm"
              icon={<Trash2 size={18} color={colors.error} />}
              style={styles.deleteButton}
            />
          </View>
        </Card>
      );
    },
    [colors, handleStartFromRoutine, handleDeleteRoutine, allExercises]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Routines</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {routines.length} saved routines
          </Text>
        </View>
      </Animated.View>

      {/* Routine List */}
      {routines.length === 0 ? (
        <Animated.View
          style={[styles.emptyState, { opacity: emptyStateOpacity }]}
        >
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.surfaceVariant },
            ]}
          >
            <FolderHeart size={40} color={colors.textTertiary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No routines yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Save your favorite workouts as routines to quickly start them again. After completing a workout, tap "Save as Routine" to create one.
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={routines}
          renderItem={renderRoutineItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xxs,
  },
  list: {
    padding: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 120,
  },
  routineCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  routineHeader: {
    marginBottom: spacing.md,
  },
  routineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routineIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  routineName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
    flex: 1,
  },
  routineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  routineDescription: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.md + 4,
    lineHeight: 20,
  },
  exercisePreview: {
    marginBottom: spacing.md,
    marginLeft: spacing.md + 4,
  },
  exercisePreviewText: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xxs,
  },
  moreExercises: {
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
  routineStats: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statItem: {
    marginRight: spacing.xl,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  deleteButton: {
    paddingHorizontal: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
});
