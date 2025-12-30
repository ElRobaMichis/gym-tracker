import React, { useCallback, useRef } from 'react';
import { StyleSheet, ViewStyle, StyleProp, Pressable, Animated, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius, scales } from '../../constants/theme';
import { springConfig } from '../../utils/animations';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'filled' | 'outlined' | 'ghost';
  color?: 'primary' | 'secondary' | 'accent' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
}

export function IconButton({
  icon,
  onPress,
  variant = 'default',
  color = 'neutral',
  size = 'md',
  disabled = false,
  style,
  haptic = true,
}: IconButtonProps) {
  const { colors, glows, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: scales.pressed,
      ...springConfig.snappy,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...springConfig.default,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (haptic && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [onPress, haptic, disabled]);

  const getColor = (): string => {
    if (disabled) return colors.textDisabled;
    switch (color) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'accent':
        return colors.accent;
      case 'error':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getBackgroundColor = (): string => {
    if (disabled) return colors.surfaceVariant;
    switch (variant) {
      case 'filled':
        return getColor();
      case 'outlined':
      case 'ghost':
        return 'transparent';
      default:
        return colors.surfaceVariant;
    }
  };

  const getBorderColor = (): string => {
    if (variant === 'outlined') {
      return getColor();
    }
    return 'transparent';
  };

  const getSize = (): number => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 48;
      default:
        return 40;
    }
  };

  const getGlow = (): ViewStyle | null => {
    if (!isDark || variant !== 'filled' || disabled) return null;
    switch (color) {
      case 'primary':
        return glows.primary;
      case 'secondary':
        return glows.secondary;
      case 'accent':
        return glows.accent;
      case 'error':
        return glows.error;
      default:
        return null;
    }
  };

  const buttonSize = getSize();
  const glowStyle = getGlow();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: variant === 'outlined' ? 1.5 : 0,
          },
          glowStyle,
          style,
        ]}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
}

// Toggle button for checkboxes/switches
interface ToggleButtonProps {
  isActive: boolean;
  onToggle: () => void;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ToggleButton({
  isActive,
  onToggle,
  activeIcon,
  inactiveIcon,
  size = 'md',
  color = 'secondary',
  disabled = false,
  style,
}: ToggleButtonProps) {
  return (
    <IconButton
      icon={isActive ? activeIcon : inactiveIcon}
      onPress={onToggle}
      variant={isActive ? 'filled' : 'outlined'}
      color={isActive ? color : 'neutral'}
      size={size}
      disabled={disabled}
      style={style}
    />
  );
}

// Close/dismiss button
interface CloseButtonProps {
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export function CloseButton({ onPress, size = 'sm', style }: CloseButtonProps) {
  const { colors } = useTheme();

  return (
    <IconButton
      icon={
        <Text style={{ color: colors.textSecondary, fontSize: size === 'sm' ? 16 : 20 }}>
          ✕
        </Text>
      }
      onPress={onPress}
      variant="ghost"
      color="neutral"
      size={size}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
