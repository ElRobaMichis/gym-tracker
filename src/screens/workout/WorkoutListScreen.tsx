import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Play, Dumbbell, Clock, Weight, Layers } from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/useStore';
import { startWorkout } from '../../store/slices/workoutSlice';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Workout } from '../../types';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from '../../constants/theme';
import { v4 as uuidv4 } from 'uuid';
import { getDisplayWeight } from '../../utils/unitConversion';

type RootStackParamList = {
  WorkoutList: undefined;
  ActiveWorkout: undefined;
  WorkoutDetail: { workoutId: string };
  ExerciseSelect: undefined;
};

export function WorkoutListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { colors, isDark, glows } = useTheme();
  const { workouts, activeWorkout } = useAppSelector(state => state.workouts);
  const { user } = useAppSelector(state => state.user);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  const activeCardOpacity = useRef(new Animated.Value(0)).current;
  const activeCardTranslateY = useRef(new Animated.Value(20)).current;
  const emptyStateOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header fade in
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Empty state fade in
    if (workouts.length === 0) {
      Animated.timing(emptyStateOpacity, {
        toValue: 1,
        delay: 200,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  useEffect(() => {
    if (activeWorkout) {
      // Active card entrance
      Animated.parallel([
        Animated.timing(activeCardOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(activeCardTranslateY, {
          toValue: 0,
          tension: 120,
          friction: 14,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation
      const pulseScaleAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseScaleAnim.start();

      const pulseOpacityAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.5,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseOpacityAnim.start();

      // Cleanup: stop animations when component unmounts or activeWorkout changes
      return () => {
        pulseScaleAnim.stop();
        pulseOpacityAnim.stop();
        pulseScale.setValue(1);
        pulseOpacity.setValue(1);
      };
    }
  }, [activeWorkout]);

  const handleStartWorkout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (activeWorkout) {
      navigation.navigate('ActiveWorkout');
      return;
    }

    const newWorkout: Workout = {
      id: uuidv4(),
      userId: user.id,
      name: getWorkoutName(),
      date: new Date().toISOString(),
      completed: false,
      exercises: [],
      createdAt: new Date().toISOString(),
    };

    dispatch(startWorkout(newWorkout));
    navigation.navigate('ActiveWorkout');
  }, [activeWorkout, user.id, dispatch, navigation]);

  const getWorkoutName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${days[new Date().getDay()]} Workout`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins % 60}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderWorkoutItem = useCallback(
    ({ item, index }: { item: Workout; index: number }) => {
      const totalSets = item.exercises.reduce(
        (total, ex) => total + ex.sets.filter(s => !s.isWarmup && s.completed).length,
        0
      );
      const totalVolume = Math.round(item.exercises.reduce(
        (total, ex) =>
          total +
          ex.sets
            .filter(s => !s.isWarmup && s.completed)
            .reduce((sum, s) => {
              // Convert weight to user's current unit for display
              const displayWeight = getDisplayWeight(s.weight, s.weightUnit, user.settings.units);
              return sum + displayWeight * s.reps;
            }, 0),
        0
      ));

      return (
        <Card
          variant="elevated"
          onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
          pressable
          haptic
          animated
          animationDelay={index * 50}
          style={styles.workoutCard}
        >
          <View style={styles.workoutHeader}>
            <View style={styles.workoutTitleRow}>
              <Text style={[styles.workoutName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Badge label={formatDate(item.date)} variant="neutral" size="sm" />
            </View>
          </View>

          <View style={styles.workoutStats}>
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

            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Weight size={14} color={colors.accent} strokeWidth={2.5} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {totalVolume >= 1000
                    ? `${(totalVolume / 1000).toFixed(1)}k`
                    : totalVolume}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                {user.settings.units}
              </Text>
            </View>

            {item.duration && (
              <View style={styles.statItem}>
                <View style={styles.statIconRow}>
                  <Clock size={14} color={colors.textSecondary} strokeWidth={2.5} />
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatDuration(item.duration)}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                  Time
                </Text>
              </View>
            )}
          </View>
        </Card>
      );
    },
    [colors, navigation, user.settings.units]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <Animated.View
        style={[styles.header, { opacity: headerOpacity }]}
      >
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Workouts</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {workouts.length} sessions logged
          </Text>
        </View>
        <Button
          title={activeWorkout ? 'Continue' : 'Start'}
          onPress={handleStartWorkout}
          variant={activeWorkout ? 'secondary' : 'primary'}
          gradient={!activeWorkout}
          icon={<Play size={18} color="#FFFFFF" fill="#FFFFFF" />}
        />
      </Animated.View>

      {/* Active Workout Banner */}
      {activeWorkout && (
        <Animated.View
          style={{
            opacity: activeCardOpacity,
            transform: [{ translateY: activeCardTranslateY }],
          }}
        >
          <Card
            variant="elevated"
            glowing="primary"
            onPress={() => navigation.navigate('ActiveWorkout')}
            pressable
            style={styles.activeCard}
          >
            <LinearGradient
              colors={[colors.primaryMuted, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.activeHeader}>
              <View style={styles.activeIndicator}>
                <Animated.View
                  style={[
                    styles.activeDot,
                    {
                      backgroundColor: colors.primary,
                      transform: [{ scale: pulseScale }],
                      opacity: pulseOpacity,
                    },
                  ]}
                />
                <Text style={[styles.activeText, { color: colors.primary }]}>
                  In Progress
                </Text>
              </View>
              <Text style={[styles.activeName, { color: colors.text }]}>
                {activeWorkout.name}
              </Text>
            </View>
            <View style={styles.activeStats}>
              <Text style={[styles.activeStatText, { color: colors.textSecondary }]}>
                {activeWorkout.exercises.length} exercises
              </Text>
              <View
                style={[styles.activeDivider, { backgroundColor: colors.border }]}
              />
              <Text style={[styles.activeStatText, { color: colors.textSecondary }]}>
                {activeWorkout.exercises.reduce(
                  (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
                  0
                )}{' '}
                sets completed
              </Text>
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Workout List */}
      {workouts.length === 0 ? (
        <Animated.View
          style={[styles.emptyState, { opacity: emptyStateOpacity }]}
        >
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.surfaceVariant },
            ]}
          >
            <Dumbbell size={40} color={colors.textTertiary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No workouts yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Start your first workout to begin tracking your progress
          </Text>
          <Button
            title="Start Your First Workout"
            onPress={handleStartWorkout}
            variant="primary"
            gradient
            icon={<Play size={18} color="#FFFFFF" fill="#FFFFFF" />}
            style={styles.emptyButton}
          />
        </Animated.View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
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
  activeCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  activeHeader: {
    marginBottom: spacing.sm,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  activeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  activeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeStatText: {
    fontSize: fontSize.sm,
  },
  activeDivider: {
    width: 1,
    height: 12,
    marginHorizontal: spacing.sm,
  },
  list: {
    padding: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 120,
  },
  workoutCard: {
    marginBottom: spacing.md,
  },
  workoutHeader: {
    marginBottom: spacing.md,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  workoutStats: {
    flexDirection: 'row',
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
