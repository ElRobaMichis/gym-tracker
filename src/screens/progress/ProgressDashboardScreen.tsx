import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  Animated,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  Calendar,
  Dumbbell,
  Layers,
  Weight,
  Trophy,
  ChevronRight,
} from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/useStore';
import { updateSettings } from '../../store/slices/userSlice';
import { useTheme } from '../../hooks/useTheme';
import { Card, StatCard } from '../../components/common/Card';
import { Badge, PRBadge } from '../../components/common/Badge';
import { AnimatedNumber, StatNumber } from '../../components/common/AnimatedNumber';
import { ProgressRing } from '../../components/common/ProgressRing';
import { WorkoutCalendar } from '../../components/common/WorkoutCalendar';
import { calculate1RM, calculateVolume, getBestSet } from '../../services/progression';
import { getDisplayWeight } from '../../utils/unitConversion';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from '../../constants/theme';

const screenWidth = Dimensions.get('window').width;

export function ProgressDashboardScreen() {
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { workouts } = useAppSelector(state => state.workouts);
  const { exercises } = useAppSelector(state => state.exercises);
  const { user } = useAppSelector(state => state.user);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [detailExerciseId, setDetailExerciseId] = useState<string | null>(null);

  const weeklyGoal = user.settings.weeklyGoal || 4;

  // Fade animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const stats = useMemo(() => {
    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce(
      (sum, w) =>
        sum + w.exercises.reduce(
          (eSum, e) => eSum + e.sets.filter(s => !s.isWarmup && s.completed).length,
          0
        ),
      0
    );
    const totalVolume = Math.round(workouts.reduce(
      (sum, w) =>
        sum + w.exercises.reduce(
          (eSum, e) =>
            eSum + e.sets
              .filter(s => !s.isWarmup && s.completed)
              .reduce((sSum, s) => {
                // Convert weight to user's current unit
                const weight = getDisplayWeight(s.weight, s.weightUnit, user.settings.units);
                return sSum + weight * s.reps;
              }, 0),
          0
        ),
      0
    ));

    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const workoutsThisWeek = workouts.filter(
      w => new Date(w.date) >= thisWeekStart
    ).length;

    // Calculate weekly goal progress
    const weeklyProgress = Math.min(workoutsThisWeek / weeklyGoal, 1);

    return { totalWorkouts, totalSets, totalVolume, workoutsThisWeek, weeklyProgress };
  }, [workouts, weeklyGoal, user.settings.units]);

  // Get all workout dates for calendar
  const workoutDates = useMemo(() => {
    return workouts.map(w => w.date);
  }, [workouts]);

  const handleUpdateWeeklyGoal = useCallback((goal: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(updateSettings({ weeklyGoal: goal }));
    setShowGoalModal(false);
  }, [dispatch]);

  const handleOpenExerciseDetail = useCallback((exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetailExerciseId(exerciseId);
    setShowExerciseModal(true);
  }, []);

  const goalOptions = [2, 3, 4, 5, 6, 7];

  const exerciseStats = useMemo(() => {
    const statsMap = new Map<string, {
      exerciseId: string;
      name: string;
      sessions: number;
      bestWeight: number;
      best1RM: number;
      progressData: { date: string; value: number }[];
    }>();

    const currentUnit = user.settings.units;

    exercises.forEach(exercise => {
      const sessions: { date: string; weight: number; reps: number; weightUnit?: 'kg' | 'lb' }[] = [];

      workouts.forEach(workout => {
        const workoutExercise = workout.exercises.find(
          e => e.exerciseId === exercise.id
        );
        if (workoutExercise) {
          const bestSet = getBestSet(workoutExercise.sets);
          if (bestSet) {
            sessions.push({
              date: workout.date,
              weight: bestSet.weight,
              reps: bestSet.reps,
              weightUnit: bestSet.weightUnit,
            });
          }
        }
      });

      if (sessions.length > 0) {
        sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Convert weights to current user unit for display
        const convertedSessions = sessions.map(s => {
          const displayWeight = getDisplayWeight(s.weight, s.weightUnit, currentUnit);
          return { ...s, displayWeight };
        });

        const bestWeight = Math.round(Math.max(...convertedSessions.map(s => s.displayWeight)));
        const best1RM = Math.round(Math.max(...convertedSessions.map(s => calculate1RM(s.displayWeight, s.reps))));

        statsMap.set(exercise.id, {
          exerciseId: exercise.id,
          name: exercise.name,
          sessions: sessions.length,
          bestWeight,
          best1RM,
          progressData: convertedSessions.map(s => ({
            date: s.date,
            value: Math.round(calculate1RM(s.displayWeight, s.reps)),
          })),
        });
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => b.sessions - a.sessions);
  }, [workouts, exercises, user.settings.units]);

  const selectedExerciseData = selectedExerciseId
    ? exerciseStats.find(e => e.exerciseId === selectedExerciseId)
    : exerciseStats[0];

  // Get detail exercise data for modal
  const detailExerciseData = detailExerciseId
    ? exerciseStats.find(e => e.exerciseId === detailExerciseId)
    : null;

  const detailChartData = useMemo(() => {
    if (!detailExerciseData || detailExerciseData.progressData.length < 2) {
      return null;
    }
    const data = detailExerciseData.progressData.slice(-10);
    return {
      labels: data.map((_, i) => (i + 1).toString()),
      datasets: [{ data: data.map(d => d.value), strokeWidth: 3 }],
    };
  }, [detailExerciseData]);

  const chartData = useMemo(() => {
    if (!selectedExerciseData || selectedExerciseData.progressData.length < 2) {
      return null;
    }

    const data = selectedExerciseData.progressData.slice(-10);
    return {
      labels: data.map((_, i) => (i + 1).toString()),
      datasets: [
        {
          data: data.map(d => d.value),
          strokeWidth: 3,
        },
      ],
    };
  }, [selectedExerciseData]);

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => colors.textTertiary,
    strokeWidth: 3,
    decimalPlaces: 0,
    propsForDots: {
      r: 5,
      strokeWidth: 2,
      stroke: colors.primary,
      fill: colors.background,
    },
    propsForBackgroundLines: {
      strokeDasharray: '4,4',
      stroke: colors.border,
      strokeWidth: 1,
    },
    fillShadowGradient: colors.primary,
    fillShadowGradientOpacity: 0.2,
    fillShadowGradientFrom: colors.primary,
    fillShadowGradientTo: 'transparent',
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim }]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Progress</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your gains
          </Text>
        </Animated.View>

        {/* Weekly Progress Ring */}
        <Animated.View
          style={[styles.weeklySection, { opacity: fadeAnim }]}
        >
          <Card
            variant="elevated"
            style={styles.weeklyCard}
            onPress={() => setShowGoalModal(true)}
            pressable
          >
            <LinearGradient
              colors={[colors.primaryMuted, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.weeklyContent}>
              <ProgressRing
                progress={stats.weeklyProgress}
                size={100}
                strokeWidth={10}
                color="primary"
              >
                <Text style={[styles.weeklyCount, { color: colors.text }]}>
                  {stats.workoutsThisWeek}
                </Text>
                <Text style={[styles.weeklyLabel, { color: colors.textSecondary }]}>
                  /{weeklyGoal}
                </Text>
              </ProgressRing>
              <View style={styles.weeklyInfo}>
                <View style={styles.weeklyTitleRow}>
                  <Text style={[styles.weeklyTitle, { color: colors.text }]}>
                    Weekly Goal
                  </Text>
                  <Text style={[styles.weeklyEditHint, { color: colors.primary }]}>
                    Tap to edit
                  </Text>
                </View>
                <Text style={[styles.weeklySubtitle, { color: colors.textSecondary }]}>
                  {stats.workoutsThisWeek >= weeklyGoal
                    ? 'Goal achieved! 🎉'
                    : `${weeklyGoal - stats.workoutsThisWeek} more to go`}
                </Text>
                <View style={styles.weeklyStats}>
                  <Calendar size={14} color={colors.primary} />
                  <Text style={[styles.weeklyStatText, { color: colors.textSecondary }]}>
                    This week
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Activity Calendar */}
        <Animated.View
          style={[styles.calendarSection, { opacity: fadeAnim }]}
        >
          <Card variant="elevated">
            <WorkoutCalendar workoutDates={workoutDates} weeks={12} />
          </Card>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View
          style={[styles.statsGrid, { opacity: fadeAnim }]}
        >
          <StatCard
            animated
            animationDelay={0}
            style={styles.statCard}
          >
            <Dumbbell size={20} color={colors.primary} strokeWidth={2.5} />
            <AnimatedNumber
              value={stats.totalWorkouts}
              colorize="primary"
              size="lg"
            />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Workouts
            </Text>
          </StatCard>

          <StatCard
            animated
            animationDelay={50}
            style={styles.statCard}
          >
            <Layers size={20} color={colors.secondary} strokeWidth={2.5} />
            <AnimatedNumber
              value={stats.totalSets}
              colorize="secondary"
              size="lg"
            />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Sets
            </Text>
          </StatCard>

          <StatCard
            animated
            animationDelay={100}
            glowing={stats.totalVolume > 100000 ? 'accent' : false}
            style={[styles.statCard, styles.statCardWide]}
          >
            <Weight size={20} color={colors.accent} strokeWidth={2.5} />
            <AnimatedNumber
              value={Math.round(stats.totalVolume / 1000)}
              suffix="k"
              colorize="accent"
              size="lg"
            />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {user.settings.units} Volume
            </Text>
          </StatCard>
        </Animated.View>

        {/* Progress Chart */}
        {chartData && selectedExerciseData && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Card variant="elevated" style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>
                    {selectedExerciseData.name}
                  </Text>
                  <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                    Estimated 1RM Progress
                  </Text>
                </View>
                <View style={styles.chartBest}>
                  <Text style={[styles.chartBestValue, { color: colors.primary }]}>
                    {selectedExerciseData.best1RM}
                  </Text>
                  <Text style={[styles.chartBestLabel, { color: colors.textTertiary }]}>
                    Best {user.settings.units}
                  </Text>
                </View>
              </View>
              <LineChart
                data={chartData}
                width={screenWidth - spacing.md * 4}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withHorizontalLabels={true}
                withVerticalLabels={false}
                withInnerLines={true}
                withOuterLines={false}
              />
            </Card>
          </Animated.View>
        )}

        {/* Personal Records */}
        <Animated.View
          style={[styles.prSection, { opacity: fadeAnim }]}
        >
          <View style={styles.sectionHeader}>
            <Trophy size={20} color={colors.accent} strokeWidth={2.5} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Personal Records
            </Text>
          </View>

          {exerciseStats.slice(0, 8).map((stat, index) => (
            <Animated.View
              key={stat.exerciseId}
              style={{ opacity: fadeAnim }}
            >
              <Card
                variant="elevated"
                style={styles.prCard}
                onPress={() => handleOpenExerciseDetail(stat.exerciseId)}
                pressable
                haptic
              >
                  <View style={styles.prHeader}>
                    <View style={styles.prInfo}>
                      <Text style={[styles.prName, { color: colors.text }]}>
                        {stat.name}
                      </Text>
                      <Text style={[styles.prSessions, { color: colors.textTertiary }]}>
                        {stat.sessions} sessions
                      </Text>
                    </View>
                    <ChevronRight size={20} color={colors.textTertiary} />
                  </View>
                  <View style={styles.prStats}>
                    <View style={styles.prStat}>
                      <Text style={[styles.prValue, { color: colors.primary }]}>
                        {stat.bestWeight}
                      </Text>
                      <Text style={[styles.prLabel, { color: colors.textSecondary }]}>
                        Max ({user.settings.units})
                      </Text>
                    </View>
                    <View style={[styles.prDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.prStat}>
                      <Text style={[styles.prValue, { color: colors.secondary }]}>
                        {stat.best1RM}
                      </Text>
                      <Text style={[styles.prLabel, { color: colors.textSecondary }]}>
                        Est. 1RM
                      </Text>
                    </View>
                  </View>
              </Card>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Empty State */}
        {exerciseStats.length === 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Card variant="elevated" style={styles.emptyCard}>
              <TrendingUp size={40} color={colors.textTertiary} strokeWidth={1.5} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No data yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Complete some workouts to see your progress and personal records here.
              </Text>
            </Card>
          </Animated.View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Weekly Goal Modal */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowGoalModal(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
            onPress={e => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Weekly Workout Goal
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              How many workouts per week?
            </Text>
            <View style={styles.goalOptions}>
              {goalOptions.map(goal => (
                <Pressable
                  key={goal}
                  style={[
                    styles.goalOption,
                    {
                      backgroundColor: goal === weeklyGoal
                        ? colors.primary
                        : colors.surfaceVariant,
                      borderColor: goal === weeklyGoal
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() => handleUpdateWeeklyGoal(goal)}
                >
                  <Text
                    style={[
                      styles.goalOptionText,
                      { color: goal === weeklyGoal ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {goal}
                  </Text>
                  <Text
                    style={[
                      styles.goalOptionLabel,
                      { color: goal === weeklyGoal ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
                    ]}
                  >
                    {goal === 1 ? 'day' : 'days'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Exercise Detail Modal */}
      <Modal
        visible={showExerciseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View style={styles.exerciseModalContainer}>
          <Pressable
            style={styles.exerciseModalOverlay}
            onPress={() => setShowExerciseModal(false)}
          />
          <View style={[styles.exerciseModalContent, { backgroundColor: colors.surface }]}>
            {/* Handle */}
            <View style={styles.modalHandle}>
              <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
            </View>

            {detailExerciseData && (
              <>
                {/* Header */}
                <View style={styles.exerciseModalHeader}>
                  <Text style={[styles.exerciseModalTitle, { color: colors.text }]}>
                    {detailExerciseData.name}
                  </Text>
                  <Text style={[styles.exerciseModalSubtitle, { color: colors.textSecondary }]}>
                    {detailExerciseData.sessions} sessions tracked
                  </Text>
                </View>

                {/* Stats Row */}
                <View style={styles.exerciseModalStats}>
                  <View style={[styles.exerciseModalStat, { backgroundColor: colors.primaryMuted }]}>
                    <Text style={[styles.exerciseModalStatValue, { color: colors.primary }]}>
                      {detailExerciseData.bestWeight}
                    </Text>
                    <Text style={[styles.exerciseModalStatLabel, { color: colors.textSecondary }]}>
                      Max {user.settings.units}
                    </Text>
                  </View>
                  <View style={[styles.exerciseModalStat, { backgroundColor: colors.secondaryMuted }]}>
                    <Text style={[styles.exerciseModalStatValue, { color: colors.secondary }]}>
                      {detailExerciseData.best1RM}
                    </Text>
                    <Text style={[styles.exerciseModalStatLabel, { color: colors.textSecondary }]}>
                      Est. 1RM
                    </Text>
                  </View>
                </View>

                {/* Chart */}
                {detailChartData ? (
                  <View style={styles.exerciseModalChart}>
                    <Text style={[styles.exerciseModalChartTitle, { color: colors.text }]}>
                      1RM Progress
                    </Text>
                    <LineChart
                      data={detailChartData}
                      width={screenWidth - spacing.lg * 2 - spacing.md * 2}
                      height={180}
                      chartConfig={chartConfig}
                      bezier
                      style={styles.chart}
                      withHorizontalLabels={true}
                      withVerticalLabels={false}
                      withInnerLines={true}
                      withOuterLines={false}
                    />
                  </View>
                ) : (
                  <View style={styles.exerciseModalNoChart}>
                    <Text style={[styles.exerciseModalNoChartText, { color: colors.textTertiary }]}>
                      Complete more sessions to see progress chart
                    </Text>
                  </View>
                )}

                {/* Recent Sessions */}
                <View style={styles.exerciseModalSessions}>
                  <Text style={[styles.exerciseModalSessionsTitle, { color: colors.text }]}>
                    Recent Sessions
                  </Text>
                  {detailExerciseData.progressData.slice(-5).reverse().map((session, index) => (
                    <View
                      key={index}
                      style={[styles.exerciseModalSession, { borderBottomColor: colors.border }]}
                    >
                      <Text style={[styles.exerciseModalSessionDate, { color: colors.textSecondary }]}>
                        {new Date(session.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                      <Text style={[styles.exerciseModalSessionValue, { color: colors.text }]}>
                        {session.value} {user.settings.units} (1RM)
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Close Button */}
            <Pressable
              style={[styles.exerciseModalClose, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => setShowExerciseModal(false)}
            >
              <Text style={[styles.exerciseModalCloseText, { color: colors.text }]}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.lg,
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
  weeklySection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  weeklyCard: {
    overflow: 'hidden',
  },
  weeklyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyCount: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  weeklyLabel: {
    fontSize: fontSize.sm,
  },
  weeklyInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  weeklyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weeklyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  weeklyEditHint: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  weeklySubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xxs,
  },
  weeklyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  weeklyStatText: {
    fontSize: fontSize.sm,
  },
  calendarSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  statCardWide: {
    flexBasis: '100%',
    flexGrow: 0,
    flexShrink: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statLabel: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  chartSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xxs,
  },
  chartBest: {
    alignItems: 'flex-end',
  },
  chartBestValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  chartBestLabel: {
    fontSize: fontSize.xs,
  },
  chart: {
    borderRadius: borderRadius.md,
    marginLeft: -spacing.md,
  },
  prSection: {
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  prCard: {
    marginBottom: spacing.sm,
  },
  prHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  prInfo: {
    flex: 1,
  },
  prName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  prSessions: {
    fontSize: fontSize.sm,
    marginTop: spacing.xxs,
  },
  prStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prStat: {
    flex: 1,
  },
  prDivider: {
    width: 1,
    height: 30,
    marginHorizontal: spacing.md,
  },
  prValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  prLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xxs,
  },
  emptyCard: {
    marginHorizontal: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomPadding: {
    height: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  goalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  goalOption: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalOptionText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  goalOptionLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xxs,
  },
  exerciseModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  exerciseModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  exerciseModalContent: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '85%',
  },
  modalHandle: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  exerciseModalHeader: {
    marginBottom: spacing.lg,
  },
  exerciseModalTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  exerciseModalSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xxs,
  },
  exerciseModalStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  exerciseModalStat: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  exerciseModalStatValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  exerciseModalStatLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xxs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseModalChart: {
    marginBottom: spacing.lg,
  },
  exerciseModalChartTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  exerciseModalNoChart: {
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  exerciseModalNoChartText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  exerciseModalSessions: {
    marginBottom: spacing.lg,
  },
  exerciseModalSessionsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  exerciseModalSession: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  exerciseModalSessionDate: {
    fontSize: fontSize.sm,
  },
  exerciseModalSessionValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  exerciseModalClose: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  exerciseModalCloseText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
