import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  Plus,
  Timer,
  Dumbbell,
  Layers,
  Weight,
  X,
  Check,
} from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/useStore';
import {
  endWorkout,
  cancelWorkout,
  addSetToExercise,
  updateSet,
  deleteSet,
  removeExerciseFromWorkout,
} from '../../store/slices/workoutSlice';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ExerciseCard } from '../../components/workout/ExerciseCard';
import { WorkoutProgressRing } from '../../components/common/ProgressRing';
import { WorkoutSet } from '../../types';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from '../../constants/theme';
import { springConfig } from '../../utils/animations';
import { getDisplayWeight } from '../../utils/unitConversion';

type RootStackParamList = {
  WorkoutList: undefined;
  ActiveWorkout: undefined;
  ExerciseSelect: undefined;
};

export function ActiveWorkoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();

  const { activeWorkout, workouts } = useAppSelector(state => state.workouts);
  const { exercises } = useAppSelector(state => state.exercises);
  const { user } = useAppSelector(state => state.user);

  const [elapsedTime, setElapsedTime] = useState(0);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const timerPulse = useRef(new Animated.Value(1)).current;
  const emptyStateOpacity = useRef(new Animated.Value(0)).current;
  const emptyStateTranslateY = useRef(new Animated.Value(20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const addButtonOpacity = useRef(new Animated.Value(0)).current;
  const addButtonTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Header fade in
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Timer pulse animation
    const timerPulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(timerPulse, {
          toValue: 1.02,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(timerPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    timerPulseAnim.start();

    // Footer fade in
    Animated.timing(footerOpacity, {
      toValue: 1,
      delay: 400,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Cleanup
    return () => {
      timerPulseAnim.stop();
      timerPulse.setValue(1);
    };
  }, []);

  useEffect(() => {
    if (activeWorkout && activeWorkout.exercises.length === 0) {
      Animated.parallel([
        Animated.timing(emptyStateOpacity, {
          toValue: 1,
          delay: 200,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(emptyStateTranslateY, {
          toValue: 0,
          delay: 200,
          ...springConfig.default,
        }),
      ]).start();
    } else if (activeWorkout && activeWorkout.exercises.length > 0) {
      Animated.parallel([
        Animated.timing(addButtonOpacity, {
          toValue: 1,
          delay: 300,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(addButtonTranslateY, {
          toValue: 0,
          delay: 300,
          ...springConfig.default,
        }),
      ]).start();
    }
  }, [activeWorkout?.exercises.length]);

  useEffect(() => {
    if (!activeWorkout) {
      navigation.goBack();
      return;
    }

    const startTime = new Date(activeWorkout.date).getTime();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout]);

  if (!activeWorkout) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPreviousSets = (exerciseId: string): WorkoutSet[] => {
    for (const workout of workouts) {
      const exercise = workout.exercises.find(e => e.exerciseId === exerciseId);
      if (exercise) {
        return exercise.sets.filter(s => !s.isWarmup && s.completed);
      }
    }
    return [];
  };

  const handleAddSet = (workoutExerciseId: string, set: WorkoutSet) => {
    dispatch(addSetToExercise({ workoutExerciseId, set }));
  };

  const handleUpdateSet = (
    workoutExerciseId: string,
    setId: string,
    updates: Partial<WorkoutSet>
  ) => {
    dispatch(updateSet({ workoutExerciseId, setId, updates }));
  };

  const handleDeleteSet = (workoutExerciseId: string, setId: string) => {
    dispatch(deleteSet({ workoutExerciseId, setId }));
  };

  const handleRemoveExercise = (workoutExerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removeExerciseFromWorkout(workoutExerciseId)),
        },
      ]
    );
  };

  const handleFinishWorkout = () => {
    const hasCompletedSets = activeWorkout.exercises.some(ex =>
      ex.sets.some(s => s.completed)
    );

    if (!hasCompletedSets) {
      Alert.alert(
        'No sets completed',
        'Complete at least one set before finishing your workout.',
        [{ text: 'OK' }]
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: () => {
            dispatch(endWorkout());
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCancelWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel? All progress will be lost.',
      [
        { text: 'Keep Working', style: 'cancel' },
        {
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: () => {
            dispatch(cancelWorkout());
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAddExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ExerciseSelect');
  };

  const totalVolume = Math.round(activeWorkout.exercises.reduce(
    (total, ex) =>
      total +
      ex.sets
        .filter(s => !s.isWarmup && s.completed)
        .reduce((sum, s) => {
          // Convert weight to user's current unit for display
          const weight = getDisplayWeight(s.weight, s.weightUnit, user.settings.units);
          return sum + weight * s.reps;
        }, 0),
    0
  ));

  const completedSets = activeWorkout.exercises.reduce(
    (total, ex) => total + ex.sets.filter(s => !s.isWarmup && s.completed).length,
    0
  );

  const totalSets = activeWorkout.exercises.reduce(
    (total, ex) => total + ex.sets.filter(s => !s.isWarmup).length,
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        style={[styles.header, { backgroundColor: colors.surface, opacity: headerOpacity }]}
      >
        <LinearGradient
          colors={[colors.primaryMuted, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          {/* Top Row */}
          <View style={styles.headerTopRow}>
            <View style={styles.workoutInfo}>
              <Text style={[styles.workoutName, { color: colors.text }]}>
                {activeWorkout.name}
              </Text>
              <View style={styles.timerRow}>
                <Timer size={16} color={colors.primary} strokeWidth={2.5} />
                <Animated.Text
                  style={[styles.timer, { color: colors.primary, transform: [{ scale: timerPulse }] }]}
                >
                  {formatTime(elapsedTime)}
                </Animated.Text>
              </View>
            </View>
            <WorkoutProgressRing
              completedSets={completedSets}
              totalSets={totalSets}
              size={70}
            />
          </View>

          {/* Stats Row */}
          <View style={[styles.statsRow, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}>
            <View style={styles.stat}>
              <View style={styles.statIconRow}>
                <Dumbbell size={14} color={colors.primary} strokeWidth={2.5} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {activeWorkout.exercises.length}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Exercises
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

            <View style={styles.stat}>
              <View style={styles.statIconRow}>
                <Layers size={14} color={colors.secondary} strokeWidth={2.5} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {completedSets}/{totalSets}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Sets Done
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

            <View style={styles.stat}>
              <View style={styles.statIconRow}>
                <Weight size={14} color={colors.accent} strokeWidth={2.5} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {totalVolume >= 1000
                    ? `${(totalVolume / 1000).toFixed(1)}k`
                    : totalVolume}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {user.settings.units} Volume
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeWorkout.exercises.length === 0 ? (
          <Animated.View
            style={[
              styles.emptyState,
              {
                opacity: emptyStateOpacity,
                transform: [{ translateY: emptyStateTranslateY }],
              },
            ]}
          >
            <Card variant="elevated" style={styles.emptyCard}>
              <Dumbbell size={40} color={colors.textTertiary} strokeWidth={1.5} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No exercises yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Add your first exercise to start tracking
              </Text>
              <Button
                title="Add Exercise"
                onPress={handleAddExercise}
                variant="primary"
                gradient
                icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.5} />}
                style={styles.emptyButton}
              />
            </Card>
          </Animated.View>
        ) : (
          <>
            {activeWorkout.exercises.map((workoutExercise, index) => {
              const exercise = exercises.find(e => e.id === workoutExercise.exerciseId);
              if (!exercise) return null;

              return (
                <ExerciseCard
                  key={workoutExercise.id}
                  workoutExercise={workoutExercise}
                  exercise={exercise}
                  previousSets={getPreviousSets(workoutExercise.exerciseId)}
                  onUpdateSet={(setId, updates) =>
                    handleUpdateSet(workoutExercise.id, setId, updates)
                  }
                  onDeleteSet={(setId) => handleDeleteSet(workoutExercise.id, setId)}
                  onAddSet={(set) => handleAddSet(workoutExercise.id, set)}
                  onRemoveExercise={() => handleRemoveExercise(workoutExercise.id)}
                  units={user.settings.units}
                  index={index}
                />
              );
            })}

            <Animated.View
              style={{
                opacity: addButtonOpacity,
                transform: [{ translateY: addButtonTranslateY }],
              }}
            >
              <Button
                title="Add Exercise"
                onPress={handleAddExercise}
                variant="outline"
                icon={<Plus size={18} color={colors.primary} strokeWidth={2.5} />}
                style={styles.addExerciseButton}
              />
            </Animated.View>
          </>
        )}

        {/* Bottom padding for footer */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Footer */}
      <Animated.View
        style={[styles.footer, { backgroundColor: colors.glass, opacity: footerOpacity }]}
      >
        <BlurView
          intensity={isDark ? 40 : 80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['bottom']} style={styles.footerContent}>
          <Button
            title="Cancel"
            onPress={handleCancelWorkout}
            variant="ghost"
            icon={<X size={18} color={colors.textSecondary} strokeWidth={2.5} />}
            style={styles.footerButton}
          />
          <Button
            title="Finish Workout"
            onPress={handleFinishWorkout}
            variant="secondary"
            gradient
            icon={<Check size={18} color="#FFFFFF" strokeWidth={2.5} />}
            style={[styles.footerButton, styles.finishButton]}
          />
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    overflow: 'hidden',
  },
  headerSafeArea: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timer: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.sm,
  },
  addExerciseButton: {
    marginTop: spacing.md,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  footerContent: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
  finishButton: {
    flex: 2,
  },
});
