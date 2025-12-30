import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius, fontSize, fontWeight } from '../../constants/theme';
import { springConfig } from '../../utils/animations';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pulse?: boolean;
}

export function Badge({
  label,
  variant = 'primary',
  size = 'sm',
  icon,
  style,
  pulse = false,
}: BadgeProps) {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulse) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          ...springConfig.bouncy,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...springConfig.default,
        }),
      ]).start();
    }
  }, [pulse]);

  const getColors = (): { bg: string; text: string; border: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.primaryMuted,
          text: colors.primary,
          border: isDark ? colors.primary : 'transparent',
        };
      case 'secondary':
        return {
          bg: colors.secondaryMuted,
          text: colors.secondary,
          border: isDark ? colors.secondary : 'transparent',
        };
      case 'accent':
        return {
          bg: colors.accentMuted,
          text: colors.accent,
          border: isDark ? colors.accent : 'transparent',
        };
      case 'success':
        return {
          bg: colors.secondaryMuted,
          text: colors.success,
          border: isDark ? colors.success : 'transparent',
        };
      case 'warning':
        return {
          bg: colors.accentMuted,
          text: colors.warning,
          border: isDark ? colors.warning : 'transparent',
        };
      case 'error':
        return {
          bg: colors.errorMuted,
          text: colors.error,
          border: isDark ? colors.error : 'transparent',
        };
      case 'neutral':
      default:
        return {
          bg: colors.surfaceVariant,
          text: colors.textSecondary,
          border: colors.border,
        };
    }
  };

  const badgeColors = getColors();
  const isSmall = size === 'sm';

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: badgeColors.bg,
          borderColor: badgeColors.border,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
          paddingVertical: isSmall ? spacing.xxs : spacing.xs,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.label,
          {
            color: badgeColors.text,
            fontSize: isSmall ? fontSize.xs : fontSize.sm,
          },
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

// PR Badge - special styling for personal records
interface PRBadgeProps {
  type?: '1RM' | 'Weight' | 'Reps' | 'Volume';
  style?: StyleProp<ViewStyle>;
}

export function PRBadge({ type = '1RM', style }: PRBadgeProps) {
  const { colors, glows, isDark } = useTheme();

  return (
    <View
      style={[
        styles.prBadge,
        {
          backgroundColor: colors.accentMuted,
          borderColor: colors.accent,
        },
        isDark && glows.accent,
        style,
      ]}
    >
      <Text style={[styles.prIcon]}>🏆</Text>
      <Text style={[styles.prLabel, { color: colors.accent }]}>
        PR{type ? ` ${type}` : ''}
      </Text>
    </View>
  );
}

// Progression badge for exercise cards
interface ProgressionBadgeProps {
  type: 'double' | 'triple';
  style?: StyleProp<ViewStyle>;
}

export function ProgressionBadge({ type, style }: ProgressionBadgeProps) {
  return (
    <Badge
      label={type === 'double' ? '2x' : '3x'}
      variant="primary"
      size="sm"
      style={style}
    />
  );
}

// Count badge for notifications/counts
interface CountBadgeProps {
  count: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'error';
  style?: StyleProp<ViewStyle>;
}

export function CountBadge({ count, variant = 'primary', style }: CountBadgeProps) {
  const { colors } = useTheme();

  const getColor = (): string => {
    switch (variant) {
      case 'secondary':
        return colors.secondary;
      case 'accent':
        return colors.accent;
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  if (count <= 0) return null;

  return (
    <View
      style={[
        styles.countBadge,
        { backgroundColor: getColor() },
        style,
      ]}
    >
      <Text style={styles.countText}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  icon: {
    marginRight: spacing.xxs,
  },
  label: {
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  prIcon: {
    fontSize: fontSize.xs,
    marginRight: spacing.xxs,
  },
  prLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
  },
});
