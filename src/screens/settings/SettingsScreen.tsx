import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  Scale,
  Palette,
  Timer,
  ChevronRight,
  Sun,
  Moon,
  Smartphone,
  Dumbbell,
  Info,
  Heart,
} from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/useStore';
import { updateSettings } from '../../store/slices/userSlice';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/common/Card';
import { spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

interface OptionButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  variant?: 'default' | 'accent';
}

function OptionButton({ label, isSelected, onPress, variant = 'default' }: OptionButtonProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const selectedColor = variant === 'accent' ? colors.secondary : colors.primary;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <View
          style={[
            styles.optionButton,
            {
              backgroundColor: isSelected ? selectedColor : colors.surfaceVariant,
              borderColor: isSelected ? selectedColor : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.optionText,
              { color: isSelected ? '#FFFFFF' : colors.text },
            ]}
          >
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function SettingRow({ icon, title, subtitle, children }: SettingRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryMuted }]}>
          {icon}
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingContent}>{children}</View>
    </View>
  );
}

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();
  const { user } = useAppSelector(state => state.user);
  const { workouts } = useAppSelector(state => state.workouts);

  // Animation values for fade-in effects
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsTranslateY = useRef(new Animated.Value(20)).current;
  const unitsOpacity = useRef(new Animated.Value(0)).current;
  const unitsTranslateY = useRef(new Animated.Value(20)).current;
  const themeOpacity = useRef(new Animated.Value(0)).current;
  const themeTranslateY = useRef(new Animated.Value(20)).current;
  const timerOpacity = useRef(new Animated.Value(0)).current;
  const timerTranslateY = useRef(new Animated.Value(20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header fade in
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Stats card fade in with delay
    Animated.parallel([
      Animated.timing(statsOpacity, {
        toValue: 1,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(statsTranslateY, {
        toValue: 0,
        delay: 100,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
    ]).start();

    // Units section fade in with delay
    Animated.parallel([
      Animated.timing(unitsOpacity, {
        toValue: 1,
        duration: 300,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.spring(unitsTranslateY, {
        toValue: 0,
        delay: 150,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
    ]).start();

    // Theme section fade in with delay
    Animated.parallel([
      Animated.timing(themeOpacity, {
        toValue: 1,
        duration: 300,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(themeTranslateY, {
        toValue: 0,
        delay: 200,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
    ]).start();

    // Timer section fade in with delay
    Animated.parallel([
      Animated.timing(timerOpacity, {
        toValue: 1,
        duration: 300,
        delay: 250,
        useNativeDriver: true,
      }),
      Animated.spring(timerTranslateY, {
        toValue: 0,
        delay: 250,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
    ]).start();

    // Footer fade in with delay
    Animated.timing(footerOpacity, {
      toValue: 1,
      duration: 300,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Calculate stats
  const totalWorkouts = workouts.length;
  const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0);
  const totalSets = workouts.reduce(
    (sum, w) => sum + w.exercises.reduce((eSum, e) => eSum + e.sets.filter(s => s.completed).length, 0),
    0
  );

  const handleUnitChange = (units: 'kg' | 'lb') => {
    dispatch(updateSettings({ units }));
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    dispatch(updateSettings({ theme }));
  };

  const handleRestTimerChange = (seconds: number) => {
    dispatch(updateSettings({ restTimerDefault: seconds }));
  };

  const themeIcons = {
    system: <Smartphone size={16} color={user.settings.theme === 'system' ? '#FFFFFF' : colors.textSecondary} />,
    light: <Sun size={16} color={user.settings.theme === 'light' ? '#FFFFFF' : colors.textSecondary} />,
    dark: <Moon size={16} color={user.settings.theme === 'dark' ? '#FFFFFF' : colors.textSecondary} />,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your experience
          </Text>
        </Animated.View>

        {/* Stats Card */}
        <Animated.View style={{ opacity: statsOpacity, transform: [{ translateY: statsTranslateY }] }}>
          <Card variant="elevated" glowing="primary" style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={[styles.statsIcon, { backgroundColor: colors.primaryMuted }]}>
                <Dumbbell size={20} color={colors.primary} strokeWidth={2.5} />
              </View>
              <Text style={[styles.statsTitle, { color: colors.text }]}>
                Your Progress
              </Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {totalWorkouts}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Workouts
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.secondary }]}>
                  {totalExercises}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Exercises
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {totalSets}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Sets
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Units */}
        <Animated.View style={{ opacity: unitsOpacity, transform: [{ translateY: unitsTranslateY }] }}>
          <Card variant="elevated" style={styles.section}>
            <SettingRow
              icon={<Scale size={18} color={colors.primary} />}
              title="Weight Units"
              subtitle="Used for tracking weights"
            >
              <View style={styles.optionRow}>
                <OptionButton
                  label="lb"
                  isSelected={user.settings.units === 'lb'}
                  onPress={() => handleUnitChange('lb')}
                />
                <OptionButton
                  label="kg"
                  isSelected={user.settings.units === 'kg'}
                  onPress={() => handleUnitChange('kg')}
                />
              </View>
            </SettingRow>
          </Card>
        </Animated.View>

        {/* Theme */}
        <Animated.View style={{ opacity: themeOpacity, transform: [{ translateY: themeTranslateY }] }}>
          <Card variant="elevated" style={styles.section}>
            <SettingRow
              icon={<Palette size={18} color={colors.primary} />}
              title="Appearance"
              subtitle="Choose your preferred theme"
            >
              <View style={styles.themeOptions}>
                {(['system', 'light', 'dark'] as const).map(theme => (
                  <Pressable
                    key={theme}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handleThemeChange(theme);
                    }}
                  >
                    <View
                      style={[
                        styles.themeOption,
                        {
                          backgroundColor:
                            user.settings.theme === theme
                              ? colors.primary
                              : colors.surfaceVariant,
                          borderColor:
                            user.settings.theme === theme
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                    >
                      {themeIcons[theme]}
                      <Text
                        style={[
                          styles.themeText,
                          {
                            color:
                              user.settings.theme === theme ? '#FFFFFF' : colors.text,
                          },
                        ]}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </SettingRow>
          </Card>
        </Animated.View>

        {/* Rest Timer */}
        <Animated.View style={{ opacity: timerOpacity, transform: [{ translateY: timerTranslateY }] }}>
          <Card variant="elevated" style={styles.section}>
            <SettingRow
              icon={<Timer size={18} color={colors.primary} />}
              title="Rest Timer"
              subtitle="Default rest period between sets"
            >
              <View style={styles.timerOptions}>
                {[60, 90, 120, 180].map(seconds => (
                  <OptionButton
                    key={seconds}
                    label={seconds >= 60 ? `${seconds / 60}m` : `${seconds}s`}
                    isSelected={user.settings.restTimerDefault === seconds}
                    onPress={() => handleRestTimerChange(seconds)}
                    variant="accent"
                  />
                ))}
              </View>
            </SettingRow>
          </Card>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <View style={[styles.footerCard, { backgroundColor: colors.surfaceVariant }]}>
            <View style={styles.footerRow}>
              <Dumbbell size={16} color={colors.textTertiary} />
              <Text style={[styles.appName, { color: colors.textSecondary }]}>
                Gym Tracker
              </Text>
            </View>
            <Text style={[styles.version, { color: colors.textTertiary }]}>
              Version 1.0.0
            </Text>
            <View style={styles.footerRow}>
              <Text style={[styles.madeWith, { color: colors.textTertiary }]}>
                Made with
              </Text>
              <Heart size={12} color={colors.error} fill={colors.error} />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
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
  statsCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  statsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xxs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  settingRow: {
    marginBottom: spacing.xs,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  settingSubtitle: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  settingContent: {},
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  optionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  themeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  timerOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  footerCard: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    width: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  appName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  version: {
    fontSize: fontSize.sm,
    marginVertical: spacing.xs,
  },
  madeWith: {
    fontSize: fontSize.xs,
  },
});
