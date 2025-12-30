import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

interface WorkoutCalendarProps {
  workoutDates: string[]; // Array of ISO date strings
  weeks?: number; // Number of weeks to show (default 12)
}

export function WorkoutCalendar({ workoutDates, weeks = 12 }: WorkoutCalendarProps) {
  const { colors, isDark } = useTheme();

  const calendarData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count workouts per day
    const workoutCounts = new Map<string, number>();
    workoutDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      workoutCounts.set(key, (workoutCounts.get(key) || 0) + 1);
    });

    // Generate grid data (weeks × 7 days)
    const totalDays = weeks * 7;
    const days: { date: Date; count: number; isToday: boolean }[] = [];

    // Start from (weeks * 7 - 1) days ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    // Adjust to start on Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    for (let i = 0; i < totalDays + dayOfWeek; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const count = workoutCounts.get(key) || 0;
      const isToday = date.toDateString() === today.toDateString();

      days.push({ date, count, isToday });
    }

    // Group into weeks (columns)
    const weekColumns: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weekColumns.push(days.slice(i, i + 7));
    }

    return weekColumns;
  }, [workoutDates, weeks]);

  // Calculate streak
  const streak = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedDates = [...workoutDates]
      .map(d => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date;
      })
      .sort((a, b) => b.getTime() - a.getTime());

    if (sortedDates.length === 0) return 0;

    let currentStreak = 0;
    let checkDate = new Date(today);

    // Check if worked out today or yesterday to start streak
    const lastWorkout = sortedDates[0];
    const diffFromToday = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));

    if (diffFromToday > 1) return 0; // No recent workout

    // If last workout was yesterday, start checking from yesterday
    if (diffFromToday === 1) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const workoutSet = new Set(
      sortedDates.map(d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
    );

    while (true) {
      const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      if (workoutSet.has(key)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  }, [workoutDates]);

  const getIntensityColor = (count: number): string => {
    if (count === 0) {
      return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    }
    if (count === 1) {
      return isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.3)';
    }
    if (count === 2) {
      return isDark ? 'rgba(99, 102, 241, 0.6)' : 'rgba(99, 102, 241, 0.5)';
    }
    return colors.primary;
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Get month labels for the grid
  const monthLabels = useMemo(() => {
    const labels: { label: string; index: number }[] = [];
    let lastMonth = -1;

    calendarData.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay && firstDay.date.getMonth() !== lastMonth) {
        lastMonth = firstDay.date.getMonth();
        labels.push({
          label: firstDay.date.toLocaleDateString('en-US', { month: 'short' }),
          index: weekIndex,
        });
      }
    });

    return labels;
  }, [calendarData]);

  return (
    <View style={styles.container}>
      {/* Header with streak */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Activity</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {workoutDates.length} workouts in {weeks} weeks
          </Text>
        </View>
        {streak > 0 && (
          <View style={[styles.streakBadge, { backgroundColor: colors.secondaryMuted }]}>
            <Text style={[styles.streakNumber, { color: colors.secondary }]}>
              {streak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.secondary }]}>
              day{streak !== 1 ? 's' : ''} streak
            </Text>
          </View>
        )}
      </View>

      {/* Month labels */}
      <View style={styles.monthLabelsContainer}>
        <View style={styles.dayLabelsPlaceholder} />
        <View style={styles.monthLabels}>
          {monthLabels.map((month, i) => (
            <Text
              key={i}
              style={[
                styles.monthLabel,
                {
                  color: colors.textTertiary,
                  left: month.index * (10 + 3),
                },
              ]}
            >
              {month.label}
            </Text>
          ))}
        </View>
      </View>

      {/* Calendar grid */}
      <View style={styles.gridContainer}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {dayLabels.map((label, i) => (
            <Text
              key={i}
              style={[
                styles.dayLabel,
                { color: colors.textTertiary },
                i % 2 === 1 && styles.dayLabelVisible,
              ]}
            >
              {i % 2 === 1 ? label : ''}
            </Text>
          ))}
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {calendarData.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {week.map((day, dayIndex) => (
                <View
                  key={dayIndex}
                  style={[
                    styles.day,
                    { backgroundColor: getIntensityColor(day.count) },
                    day.isToday && {
                      borderWidth: 1.5,
                      borderColor: colors.primary,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendLabel, { color: colors.textTertiary }]}>Less</Text>
        <View style={[styles.legendDay, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
        <View style={[styles.legendDay, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.3)' }]} />
        <View style={[styles.legendDay, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.6)' : 'rgba(99, 102, 241, 0.5)' }]} />
        <View style={[styles.legendDay, { backgroundColor: colors.primary }]} />
        <Text style={[styles.legendLabel, { color: colors.textTertiary }]}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xxs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xxs,
  },
  streakNumber: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  streakLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  monthLabelsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xxs,
  },
  dayLabelsPlaceholder: {
    width: 20,
  },
  monthLabels: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
    height: 16,
  },
  monthLabel: {
    fontSize: fontSize.xs,
    position: 'absolute',
  },
  gridContainer: {
    flexDirection: 'row',
  },
  dayLabels: {
    marginRight: spacing.xs,
    justifyContent: 'space-between',
  },
  dayLabel: {
    fontSize: 9,
    height: 10,
    lineHeight: 10,
    width: 14,
  },
  dayLabelVisible: {
    opacity: 1,
  },
  grid: {
    flexDirection: 'row',
    gap: 3,
  },
  week: {
    gap: 3,
  },
  day: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xxs,
    marginTop: spacing.xs,
  },
  legendDay: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: fontSize.xs,
  },
});
