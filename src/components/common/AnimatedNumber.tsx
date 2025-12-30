import React, { useEffect, useRef, useState } from 'react';
import { Text, TextStyle, StyleProp, View, Animated, Easing } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { fontSize, fontWeight } from '../../constants/theme';
import { springConfig } from '../../utils/animations';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: StyleProp<TextStyle>;
  colorize?: 'none' | 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'display';
  animate?: boolean;
}

export function AnimatedNumber({
  value,
  duration = 600,
  prefix = '',
  suffix = '',
  decimals = 0,
  style,
  colorize = 'none',
  size = 'lg',
  animate = true,
}: AnimatedNumberProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [displayText, setDisplayText] = useState(
    `${prefix}${animate ? '0' : (decimals > 0 ? value.toFixed(decimals) : value)}${suffix}`
  );
  const previousValue = useRef(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setDisplayText(`${prefix}${decimals > 0 ? value.toFixed(decimals) : value}${suffix}`);
      return;
    }

    // Scale bounce animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        ...springConfig.bouncy,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...springConfig.default,
      }),
    ]).start();

    // Number counting animation
    const startValue = previousValue.current;
    const startTime = Date.now();

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (value - startValue) * easedProgress;

      const formatted = decimals > 0
        ? currentValue.toFixed(decimals)
        : Math.round(currentValue).toString();

      setDisplayText(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        previousValue.current = value;
      }
    };

    requestAnimationFrame(updateValue);
  }, [value, prefix, suffix, decimals, duration, animate]);

  const getColor = (): string => {
    switch (colorize) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'accent':
        return colors.accent;
      default:
        return colors.text;
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'sm':
        return fontSize.md;
      case 'md':
        return fontSize.xl;
      case 'lg':
        return fontSize.xxl;
      case 'xl':
        return fontSize.xxxl;
      case 'display':
        return fontSize.display;
      default:
        return fontSize.xxl;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Text
        style={[
          {
            color: getColor(),
            fontSize: getFontSize(),
            fontWeight: fontWeight.bold,
            fontVariant: ['tabular-nums'],
          },
          style,
        ]}
      >
        {displayText}
      </Text>
    </Animated.View>
  );
}

// Simplified stat display with label
interface StatNumberProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  colorize?: 'none' | 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

export function StatNumber({
  value,
  label,
  prefix = '',
  suffix = '',
  decimals = 0,
  colorize = 'primary',
  size = 'md',
}: StatNumberProps) {
  const { colors } = useTheme();

  const getLabelSize = (): number => {
    switch (size) {
      case 'sm':
        return fontSize.xs;
      case 'lg':
        return fontSize.md;
      default:
        return fontSize.sm;
    }
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <AnimatedNumber
        value={value}
        prefix={prefix}
        suffix={suffix}
        decimals={decimals}
        colorize={colorize}
        size={size}
      />
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: getLabelSize(),
          marginTop: 4,
          fontWeight: fontWeight.medium,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
