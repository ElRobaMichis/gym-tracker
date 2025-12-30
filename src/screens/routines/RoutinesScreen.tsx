import React, { useCallback, useEffect, useRef } from 'react';
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
import * as Haptics from 'expo-haptics';
import {
  Plus,
  Play,
  Dumbbell,
  Layers,
  MoreVertical,
  Trash2,
  Edit3,
  FolderOpen,
} from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/useStore';
import { deleteRoutine } from '../../store/slices/routineSlice';
import { startWorkout } from '../../store/slices/workoutSlice';
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
  RoutineDetail: { routineId?: string };
};

export function RoutinesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const { routines } = useAppSelector(state => state.routines);
  const { exercises } = useAppSelector(state => state.exercises);
  const { user } = useAppSelector(state => state.user);
  const { activeWorkout } = useAppSelector(state => state.workouts);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const emptyStateOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (routines.length === 0) {
      Animated.timing(emptyStateOpacity, {
        toValue: 1,
        delay: 200,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  const handleCreateRoutine = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('RoutineDetail', {});
  }, [navigation]);

  const handleStartFromRoutine = useCallback((routine: Routine) => {
    if (activeWorkout) {
      Alert.alert(
        'Workout in Progress',
        'You already have an active workout. Please finish or cancel it first.',
        [{ text: 'OK' }]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Create workout exercises from routine
    const workoutExercises: WorkoutExercise[] = routine.exercises.map(routineExercise => {
      const exercise = exercises.find(e => e.id === routineExercise.exerciseId);
      const targetSets = routineExercise.targetSets || exercise?.targetSetsMin || 3;

      // Create empty sets based on target
      const sets: WorkoutSet[] = Array.from({ length: targetSets }, (_, index) => ({
        id: uuidv4(),
        workoutExerciseId: '', // Will be set after workout exercise is created
        setNumber: index + 1,
        weight: 0,
        weightUnit: user.settings.units,
        reps: 0,
        isWarmup: false,
        completed: false,
        createdAt: new Date().toISOString(),
      }));

      const workoutExerciseId = uuidv4();

      // Update set references
      sets.forEach(set => {
        set.workoutExerciseId = workoutExerciseId;
      });

      return {
        id: workoutExerciseId,
        workoutId: '', // Will be set after workout is created
        exerciseId: routineExercise.exerciseId,
        orderIndex: routineExercise.orderIndex,
        notes: routineExercise.notes,
        sets,
      };
    });

    const workoutId = uuidv4();

    // Update workout exercise references
    workoutExercises.forEach(we => {
      we.workoutId = workoutId;
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

    dispatch(startWorkout(newWorkout));
    navigation.navigate('ActiveWorkout');
  }, [activeWorkout, exercises, user, dispatch, navigation]);

  const handleEditRoutine = useCallback((routine: Routine) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('RoutineDetail', { routineId: routine.id });
  }, [navigation]);

  const handleDeleteRoutine = useCallback((routine: Routine) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routine.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteRoutine(routine.id)),
        },
      ]
    );
  }, [dispatch]);

  const handleRoutineOptions = useCallback((routine: Routine) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      routine.name,
      undefined,
      [
        {
          text: 'Start Workout',
          onPress: () => handleStartFromRoutine(routine),
        },
        {
          text: 'Edit Routine',
          onPress: () => handleEditRoutine(routine),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteRoutine(routine),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [handleStartFromRoutine, handleEditRoutine, handleDeleteRoutine]);

  const getExerciseNames = (routine: Routine): string => {
    const names = routine.exercises
      .slice(0, 3)
      .map(re => {
        const exercise = exercises.find(e => e.id === re.exerciseId);
        return exercise?.name || 'Unknown';
      });

    if (routine.exercises.length > 3) {
      names.push(`+${routine.exercises.length - 3} more`);
    }

    return names.join(', ');
  };

  const renderRoutineItem = useCallback(
    ({ item, index }: { item: Routine; index: number }) => {
      const totalSets = item.exercises.reduce(
        (sum, re) => sum + (re.targetSets || 3),
        0
      );

      return (
        <Card
          variant="elevated"
          onPress={() => handleStartFromRoutine(item)}
          pressable
          haptic
          animated
          animationDelay={index * 50}
          style={styles.routineCard}
        >
          <View style={styles.routineHeader}>
            <View style={styles.routineTitleRow}>
              <Text style={[styles.routineName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Button
                title=""
                onPress={() => handleRoutineOptions(item)}
                variant="ghost"
                icon={<MoreVertical size={20} color={colors.textSecondary} />}
                style={styles.optionsButton}
              />
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

          <View style={styles.routineStats}>
            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Dumbbell size={14} color={colors.primary} strokeWidth={2.5} />
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
                  {totalSets}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                Sets
              </Text>
            </View>
          </View>

          <Text
            style={[styles.exerciseList, { color: colors.textTertiary }]}
            numberOfLines={1}
          >
            {getExerciseNames(item)}
          </Text>

          <View style={styles.routineActions}>
            <Button
              title="Start"
              onPress={() => handleStartFromRoutine(item)}
              variant="primary"
              gradient
              icon={<Play size={16} color="#FFFFFF" fill="#FFFFFF" />}
              style={styles.startButton}
            />
          </View>
        </Card>
      );
    },
    [colors, handleStartFromRoutine, handleRoutineOptions, exercises]
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
        <Button
          title="New"
          onPress={handleCreateRoutine}
          variant="primary"
          gradient
          icon={<Plus size={18} color="#FFFFFF" />}
        />
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
            <FolderOpen size={40} color={colors.textTertiary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No routines yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Create your first routine to quickly start workouts with your
            favorite exercises
          </Text>
          <Button
            title="Create Your First Routine"
            onPress={handleCreateRoutine}
            variant="primary"
            gradient
            icon={<Plus size={18} color="#FFFFFF" />}
            style={styles.emptyButton}
          />
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
  },
  routineHeader: {
    marginBottom: spacing.md,
  },
  routineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
    flex: 1,
  },
  optionsButton: {
    minWidth: 40,
    paddingHorizontal: spacing.xs,
  },
  routineDescription: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  routineStats: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
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
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseList: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  routineActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  startButton: {
    minWidth: 100,
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
  emptyButton: {
    marginTop: spacing.sm,
  },
});
