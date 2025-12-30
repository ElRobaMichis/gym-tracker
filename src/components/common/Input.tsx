import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  Pressable,
  Animated,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../../constants/theme';
import { springConfig, timingConfig } from '../../utils/animations';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  onRightIconPress,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(borderColorAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.005 : 1,
        tension: 300,
        friction: 20,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isFocused]);

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur]
  );

  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'filled':
        return colors.surfaceVariant;
      case 'outlined':
        return 'transparent';
      default:
        return colors.surface;
    }
  };

  const getPadding = (): { paddingVertical: number; paddingHorizontal: number } => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm };
      case 'lg':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
      default:
        return { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.md };
    }
  };

  const getHeight = (): number => {
    switch (size) {
      case 'sm':
        return 40;
      case 'lg':
        return 56;
      default:
        return 48;
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

  const borderColor = error
    ? colors.error
    : borderColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.primary],
      });

  const labelColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textSecondary, colors.primary],
  });

  const padding = getPadding();
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Animated.Text style={[styles.label, { color: labelColor }]}>
          {label}
        </Animated.Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: getBackgroundColor(),
            borderWidth: variant === 'filled' ? 0 : 1.5,
            height: getHeight(),
            borderColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {hasLeftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: getFontSize(),
              paddingLeft: hasLeftIcon ? 0 : padding.paddingHorizontal,
              paddingRight: hasRightIcon ? 0 : padding.paddingHorizontal,
            },
            style,
          ]}
          placeholderTextColor={colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={colors.primary}
          {...props}
        />
        {hasRightIcon && (
          <Pressable
            style={styles.rightIcon}
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </Pressable>
        )}
      </Animated.View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

// Compact number input for workout sets
interface NumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  unit?: string;
  style?: ViewStyle;
}

export function NumberInput({
  value,
  onChangeText,
  placeholder,
  unit,
  style,
}: NumberInputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(borderColorAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.02 : 1,
        tension: 300,
        friction: 20,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isFocused]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.numberInputContainer,
        {
          borderColor,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <TextInput
        style={[styles.numberInput, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType="numeric"
        onFocus={handleFocus}
        onBlur={handleBlur}
        selectTextOnFocus
        selectionColor={colors.primary}
      />
      {unit && (
        <Text style={[styles.unit, { color: colors.textTertiary }]}>{unit}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: '100%',
  },
  leftIcon: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  rightIcon: {
    paddingRight: spacing.md,
    paddingLeft: spacing.sm,
  },
  error: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    fontWeight: fontWeight.medium,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 60,
  },
  numberInput: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    minWidth: 40,
    padding: 0,
  },
  unit: {
    fontSize: fontSize.xs,
    marginLeft: spacing.xxs,
  },
});
