import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { fontSize, fontWeight } from '../../constants/theme';

// Create animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'secondary' | 'accent';
  showPercentage?: boolean;
  animated?: boolean;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = 'primary',
  showPercentage = false,
  animated = true,
  children,
}: ProgressRingProps) {
  const { colors, isDark } = useTheme();
  const progressAnim = useRef(new Animated.Value(animated ? 0 : progress)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated]);

  const getGradientColors = (): [string, string] => {
    switch (color) {
      case 'secondary':
        return ['#34D399', '#10B981'];
      case 'accent':
        return ['#FBBF24', '#F59E0B'];
      default:
        return ['#818CF8', '#6366F1'];
    }
  };

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const gradientColors = getGradientColors();
  const gradientId = `gradient-${color}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        {children ? (
          children
        ) : showPercentage ? (
          <Text style={[styles.percentage, { color: colors.text }]}>
            {Math.round(progress * 100)}%
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// Smaller progress indicator for inline use
interface MiniProgressRingProps {
  progress: number;
  size?: number;
  color?: 'primary' | 'secondary' | 'accent';
}

export function MiniProgressRing({
  progress,
  size = 24,
  color = 'primary',
}: MiniProgressRingProps) {
  return (
    <ProgressRing
      progress={progress}
      size={size}
      strokeWidth={3}
      color={color}
      showPercentage={false}
      animated={true}
    />
  );
}

// Workout completion ring with sets info
interface WorkoutProgressRingProps {
  completedSets: number;
  totalSets: number;
  size?: number;
}

export function WorkoutProgressRing({
  completedSets,
  totalSets,
  size = 100,
}: WorkoutProgressRingProps) {
  const { colors } = useTheme();
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  return (
    <ProgressRing
      progress={progress}
      size={size}
      strokeWidth={10}
      color="secondary"
      animated={true}
    >
      <View style={styles.workoutContent}>
        <Text style={[styles.setsCompleted, { color: colors.text }]}>
          {completedSets}
        </Text>
        <Text style={[styles.setsTotal, { color: colors.textSecondary }]}>
          /{totalSets}
        </Text>
      </View>
    </ProgressRing>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  workoutContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  setsCompleted: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  setsTotal: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
