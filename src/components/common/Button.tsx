import React, { useCallback, useRef } from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  Pressable,
  View,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  scales,
} from '../../constants/theme';
import { springConfig } from '../../utils/animations';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  haptic?: boolean;
  gradient?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  haptic = true,
  gradient = false,
}: ButtonProps) {
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
    if (haptic && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [onPress, haptic, disabled, loading]);

  const getBackgroundColor = (): string => {
    if (disabled) return colors.surfaceVariant;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'danger':
        return colors.error;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return colors.textTertiary;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.text;
      default:
        return '#FFFFFF';
    }
  };

  const getGradientColors = (): [string, string] => {
    if (variant === 'secondary') {
      return ['#10B981', '#059669'];
    }
    if (variant === 'danger') {
      return ['#EF4444', '#DC2626'];
    }
    return ['#818CF8', '#6366F1'];
  };

  const getPadding = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'lg':
        return { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.xl };
      default:
        return { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'sm':
        return fontSize.sm;
      case 'lg':
        return fontSize.lg;
      default:
        return fontSize.md;
    }
  };

  const getBorderRadius = (): number => {
    switch (size) {
      case 'sm':
        return borderRadius.md;
      case 'lg':
        return borderRadius.xl;
      default:
        return borderRadius.lg;
    }
  };

  const getGlow = (): ViewStyle | null => {
    if (disabled || variant === 'outline' || variant === 'ghost') return null;
    if (!isDark) return null;
    switch (variant) {
      case 'primary':
        return glows.primary;
      case 'secondary':
        return glows.secondary;
      case 'danger':
        return glows.error;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getTextColor()} size="small" />;
    }

    const iconMargin = icon ? (size === 'sm' ? spacing.xs : spacing.sm) : 0;

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <View style={{ marginRight: iconMargin }}>{icon}</View>
        )}
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <View style={{ marginLeft: iconMargin }}>{icon}</View>
        )}
      </View>
    );
  };

  const buttonRadius = getBorderRadius();
  const showGradient = gradient && !disabled && (variant === 'primary' || variant === 'secondary' || variant === 'danger');
  const glowStyle = getGlow();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          getPadding(),
          {
            backgroundColor: showGradient ? 'transparent' : getBackgroundColor(),
            borderColor: variant === 'outline' ? colors.primary : 'transparent',
            borderWidth: variant === 'outline' ? 1.5 : 0,
            borderRadius: buttonRadius,
            alignSelf: fullWidth ? 'stretch' : 'auto',
          },
          glowStyle,
          style,
        ]}
      >
        {showGradient ? (
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: buttonRadius },
            ]}
          />
        ) : null}
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
  },
});
