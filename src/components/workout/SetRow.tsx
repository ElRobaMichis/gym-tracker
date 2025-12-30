import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, Flame, X } from 'lucide-react-native';
import { WorkoutSet } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../../constants/theme';
import { springConfig } from '../../utils/animations';
import { getDisplayWeight as getDisplayWeightUtil } from '../../utils/unitConversion';

interface SetRowProps {
  set: WorkoutSet;
  previousSet?: { weight: number; reps: number };
  onUpdate: (updates: Partial<WorkoutSet>) => void;
  onDelete: () => void;
  units: 'kg' | 'lb';
  index?: number;
}

export function SetRow({
  set,
  previousSet,
  onUpdate,
  onDelete,
  units,
  index = 0,
}: SetRowProps) {
  const { colors, isDark } = useTheme();

  // Convert weight for display if stored unit differs from current unit
  const getDisplayWeight = useCallback((storedWeight: number, storedUnit?: 'kg' | 'lb') => {
    return getDisplayWeightUtil(storedWeight, storedUnit, units);
  }, [units]);

  const [weight, setWeight] = useState(() =>
    getDisplayWeight(set.weight, set.weightUnit).toString()
  );
  const [reps, setReps] = useState(set.reps.toString());

  // Animation values
  const rowScale = useRef(new Animated.Value(1)).current;
  const completedProgress = useRef(new Animated.Value(set.completed ? 1 : 0)).current;
  const checkScale = useRef(new Animated.Value(set.completed ? 1 : 0)).current;
  const warmupProgress = useRef(new Animated.Value(set.isWarmup ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation
  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 50),
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          ...springConfig.default,
        }),
      ]),
    ]).start();
  }, [index]);

  // Update display when set changes or units change
  useEffect(() => {
    const displayWeight = getDisplayWeight(set.weight, set.weightUnit);
    setWeight(displayWeight.toString());
    setReps(set.reps.toString());
  }, [set.weight, set.reps, set.weightUnit, units, getDisplayWeight]);

  useEffect(() => {
    Animated.timing(completedProgress, {
      toValue: set.completed ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();

    if (set.completed) {
      Animated.sequence([
        Animated.spring(checkScale, {
          toValue: 1.3,
          ...springConfig.bouncy,
        }),
        Animated.spring(checkScale, {
          toValue: 1,
          ...springConfig.default,
        }),
      ]).start();
    } else {
      Animated.spring(checkScale, {
        toValue: 0,
        ...springConfig.snappy,
      }).start();
    }
  }, [set.completed]);

  useEffect(() => {
    Animated.timing(warmupProgress, {
      toValue: set.isWarmup ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [set.isWarmup]);

  const handleWeightBlur = () => {
    const value = parseFloat(weight) || 0;
    // Save weight with current unit for future conversion
    onUpdate({ weight: value, weightUnit: units });
  };

  const handleRepsBlur = () => {
    const value = parseInt(reps) || 0;
    onUpdate({ reps: value });
  };

  const toggleWarmup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({ isWarmup: !set.isWarmup });
  }, [set.isWarmup, onUpdate]);

  const toggleComplete = useCallback(() => {
    if (!set.completed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.spring(rowScale, {
          toValue: 1.02,
          ...springConfig.bouncy,
        }),
        Animated.spring(rowScale, {
          toValue: 1,
          ...springConfig.default,
        }),
      ]).start();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onUpdate({ completed: !set.completed });
  }, [set.completed, onUpdate]);

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Set',
      `Delete ${set.isWarmup ? 'warmup' : `set ${set.setNumber}`}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  }, [set.isWarmup, set.setNumber, onDelete]);

  // Interpolated colors
  const rowBackgroundColor = set.isWarmup
    ? colors.warmup
    : completedProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.surface, colors.completed],
      });

  const rowBorderColor = completedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.completedBorder],
  });

  const checkButtonBackground = completedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceVariant, colors.secondary],
  });

  const warmupButtonBackground = warmupProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceVariant, colors.accent],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { scale: rowScale },
          { translateX: slideAnim },
        ],
        opacity: opacityAnim,
      }}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: rowBackgroundColor,
            borderColor: rowBorderColor,
          },
        ]}
      >
      {/* Set Number - Long press to delete */}
      <Pressable
        style={styles.setNumber}
        onLongPress={handleDelete}
        delayLongPress={400}
      >
        <Text
          style={[
            styles.setNumberText,
            { color: set.isWarmup ? colors.warmupText : colors.textSecondary },
          ]}
        >
          {set.isWarmup ? 'W' : set.setNumber}
        </Text>
      </Pressable>

      {/* Previous Set */}
      <View style={styles.previousContainer}>
        {previousSet ? (
          <Text style={[styles.previousText, { color: colors.textTertiary }]}>
            {previousSet.weight} × {previousSet.reps}
          </Text>
        ) : (
          <Text style={[styles.previousText, { color: colors.textDisabled }]}>
            —
          </Text>
        )}
      </View>

      {/* Weight Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.05)'
                : colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={weight}
          onChangeText={setWeight}
          onBlur={handleWeightBlur}
          keyboardType="decimal-pad"
          selectTextOnFocus
          selectionColor={colors.primary}
        />
      </View>

      {/* Reps Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.05)'
                : colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={reps}
          onChangeText={setReps}
          onBlur={handleRepsBlur}
          keyboardType="number-pad"
          selectTextOnFocus
          selectionColor={colors.primary}
        />
      </View>

      {/* Warmup Toggle */}
      <Animated.View style={{ backgroundColor: warmupButtonBackground, borderRadius: borderRadius.md }}>
        <Pressable
          style={styles.actionButton}
          onPress={toggleWarmup}
        >
          <Flame
            size={16}
            color={set.isWarmup ? '#FFFFFF' : colors.textSecondary}
            strokeWidth={2.5}
          />
        </Pressable>
      </Animated.View>

      {/* Complete Toggle */}
      <Animated.View
        style={[
          styles.checkButtonWrapper,
          {
            backgroundColor: checkButtonBackground,
          },
        ]}
      >
        <Pressable
          style={styles.checkButton}
          onPress={toggleComplete}
        >
          {set.completed && (
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Check size={18} color="#FFFFFF" strokeWidth={3} />
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>

      {/* Delete Button */}
      <Pressable
        style={styles.deleteButton}
        onPress={handleDelete}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
      >
        <X size={14} color={colors.textTertiary} strokeWidth={2.5} />
      </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
  },
  setNumber: {
    width: 32,
    alignItems: 'center',
  },
  setNumberText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  previousContainer: {
    width: 56,
    alignItems: 'center',
  },
  previousText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  input: {
    textAlign: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  actionButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  checkButtonWrapper: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  checkButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
});
