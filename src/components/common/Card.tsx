import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, ViewStyle, StyleProp, Pressable, View, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius, scales } from '../../constants/theme';
import { springConfig, timingConfig } from '../../utils/animations';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
  onPress?: () => void;
  pressable?: boolean;
  glowing?: 'primary' | 'secondary' | 'accent' | false;
  animated?: boolean;
  animationDelay?: number;
  haptic?: boolean;
}

export function Card({
  children,
  style,
  variant = 'default',
  onPress,
  pressable = false,
  glowing = false,
  animated = false,
  animationDelay = 0,
  haptic = false,
}: CardProps) {
  const { colors, glows, isDark, shadows } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateYAnim = useRef(new Animated.Value(animated ? 16 : 0)).current;

  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.delay(animationDelay),
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(translateYAnim, {
            toValue: 0,
            ...springConfig.default,
          }),
        ]),
      ]).start();
    }
  }, [animated, animationDelay]);

  const handlePressIn = useCallback(() => {
    if (pressable || onPress) {
      Animated.spring(scaleAnim, {
        toValue: scales.pressedSoft,
        ...springConfig.snappy,
      }).start();
    }
  }, [pressable, onPress, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (pressable || onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...springConfig.default,
      }).start();
    }
  }, [pressable, onPress, scaleAnim]);

  const handlePress = useCallback(() => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  }, [onPress, haptic]);

  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'elevated':
        return isDark ? colors.surfaceElevated : colors.surface;
      case 'filled':
        return colors.surfaceVariant;
      case 'glass':
        return colors.glass;
      case 'outlined':
        return 'transparent';
      default:
        return colors.card;
    }
  };

  const getBorderColor = (): string => {
    if (glowing && isDark) {
      switch (glowing) {
        case 'primary':
          return colors.primary;
        case 'secondary':
          return colors.secondary;
        case 'accent':
          return colors.accent;
      }
    }
    switch (variant) {
      case 'outlined':
        return colors.borderStrong;
      case 'glass':
        return colors.glassBorder;
      default:
        return colors.border;
    }
  };

  const getShadow = (): ViewStyle => {
    if (variant === 'elevated') {
      return isDark ? shadows.lg : shadows.md;
    }
    return shadows.none;
  };

  const getGlow = (): ViewStyle | null => {
    if (!glowing || !isDark) return null;
    switch (glowing) {
      case 'primary':
        return glows.primary;
      case 'secondary':
        return glows.secondary;
      case 'accent':
        return glows.accent;
      default:
        return null;
    }
  };

  const glowStyle = getGlow();
  const isInteractive = pressable || !!onPress;

  const cardContent = (
    <View style={styles.content}>
      {children}
    </View>
  );

  const animatedStyles = {
    transform: [
      { scale: scaleAnim },
      { translateY: translateYAnim },
    ],
    opacity: opacityAnim,
  };

  const cardStyles = [
    styles.card,
    getShadow(),
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
    },
    glowStyle,
    style,
  ];

  if (isInteractive) {
    return (
      <Animated.View style={animatedStyles}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={cardStyles}
        >
          {cardContent}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyles, cardStyles]}>
      {cardContent}
    </Animated.View>
  );
}

// Specialized card variants
interface StatCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glowing?: 'primary' | 'secondary' | 'accent' | false;
  animated?: boolean;
  animationDelay?: number;
}

export function StatCard({
  children,
  style,
  glowing = false,
  animated = true,
  animationDelay = 0,
}: StatCardProps) {
  return (
    <Card
      variant="elevated"
      glowing={glowing}
      animated={animated}
      animationDelay={animationDelay}
      style={[styles.statCard, style]}
    >
      {children}
    </Card>
  );
}

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function GlassCard({ children, style, onPress }: GlassCardProps) {
  return (
    <Card
      variant="glass"
      onPress={onPress}
      pressable={!!onPress}
      style={style}
    >
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.md,
  },
  statCard: {
    alignItems: 'center',
  },
});
