import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/useStore';
import { deleteWorkout } from '../../store/slices/workoutSlice';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
import { calculateVolume } from '../../services/progression';
import { getDisplayWeight } from '../../utils/unitConversion';

type RouteParams = {
  WorkoutDetail: { workoutId: string };
};

export function WorkoutDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, 'WorkoutDetail'>>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const { workouts } = useAppSelector(state => state.workouts);
  const { exercises } = useAppSelector(state => state.exercises);
  const { user } = useAppSelector(state => state.user);

  const workout = workouts.find(w => w.id === route.params.workoutId);

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Workout not found
        </Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins % 60}m`;
    }
    return `${mins} minutes`;
  };

  const totalVolume = Math.round(workout.exercises.reduce(
    (total, ex) =>
      total +
      ex.sets
        .filter(s => !s.isWarmup && s.completed)
        .reduce((sum, s) => {
          const weight = getDisplayWeight(s.weight, s.weightUnit, user.settings.units);
          return sum + weight * s.reps;
        }, 0),
    0
  ));

  const totalSets = workout.exercises.reduce(
    (total, ex) => total + ex.sets.filter(s => !s.isWarmup && s.completed).length,
    0
  );

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteWorkout(workout.id));
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.workoutName, { color: colors.text }]}>
          {workout.name}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(workout.date)} at {formatTime(workout.date)}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {formatDuration(workout.duration)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Duration
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {totalSets}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Sets
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {totalVolume.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {user.settings.units}
          </Text>
        </Card>
      </View>

      {workout.exercises.map((workoutExercise) => {
        const exercise = exercises.find(e => e.id === workoutExercise.exerciseId);
        if (!exercise) return null;

        const workingSets = workoutExercise.sets.filter(s => !s.isWarmup);
        const warmupSets = workoutExercise.sets.filter(s => s.isWarmup);

        return (
          <Card key={workoutExercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={[styles.exerciseName, { color: colors.text }]}>
                {exercise.name}
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      exercise.progressionType === 'double'
                        ? colors.primary
                        : colors.secondary,
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {exercise.progressionType === 'double' ? '2x' : '3x'}
                </Text>
              </View>
            </View>

            {warmupSets.length > 0 && (
              <View style={styles.setSection}>
                <Text style={[styles.setSectionTitle, { color: colors.textTertiary }]}>
                  Warmup Sets
                </Text>
                {warmupSets.map((set, index) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={[styles.setIndex, { color: colors.warmupText }]}>
                      W
                    </Text>
                    <Text style={[styles.setDetails, { color: colors.textSecondary }]}>
                      {getDisplayWeight(set.weight, set.weightUnit, user.settings.units)} {user.settings.units} × {set.reps} reps
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.setSection}>
              {warmupSets.length > 0 && (
                <Text style={[styles.setSectionTitle, { color: colors.textTertiary }]}>
                  Working Sets
                </Text>
              )}
              {workingSets.map((set, index) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={[styles.setIndex, { color: colors.textSecondary }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.setDetails, { color: colors.text }]}>
                    {getDisplayWeight(set.weight, set.weightUnit, user.settings.units)} {user.settings.units} × {set.reps} reps
                  </Text>
                  {set.completed && (
                    <Text style={[styles.checkmark, { color: colors.success }]}>
                      ✓
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {workoutExercise.notes && (
              <Text style={[styles.notes, { color: colors.textSecondary }]}>
                {workoutExercise.notes}
              </Text>
            )}
          </Card>
        );
      })}

      {workout.notes && (
        <Card style={styles.notesCard}>
          <Text style={[styles.notesTitle, { color: colors.text }]}>
            Workout Notes
          </Text>
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>
            {workout.notes}
          </Text>
        </Card>
      )}

      <Button
        title="Delete Workout"
        onPress={handleDelete}
        variant="ghost"
        style={styles.deleteButton}
        textStyle={{ color: colors.error }}
      />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  workoutName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: fontSize.md,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  exerciseCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exerciseName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    color: '#FFF',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  setSection: {
    marginTop: spacing.xs,
  },
  setSectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  setIndex: {
    width: 24,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  setDetails: {
    flex: 1,
    fontSize: fontSize.md,
  },
  checkmark: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  notes: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  notesCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  notesTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: fontSize.md,
  },
  deleteButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  bottomPadding: {
    height: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
