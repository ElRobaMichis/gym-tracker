import { Animated, Easing } from 'react-native';
import { animationConfig, scales } from '../constants/theme';

// ============================================================================
// ANIMATION HELPERS
// ============================================================================

/**
 * Create a spring animation configuration
 */
export const springConfig = {
  default: {
    tension: 120,
    friction: 14,
    useNativeDriver: true,
  },
  bouncy: {
    tension: 180,
    friction: 12,
    useNativeDriver: true,
  },
  gentle: {
    tension: 80,
    friction: 20,
    useNativeDriver: true,
  },
  snappy: {
    tension: 200,
    friction: 22,
    useNativeDriver: true,
  },
};

/**
 * Create a timing animation configuration
 */
export const timingConfig = {
  fast: {
    duration: 150,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  normal: {
    duration: 250,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  slow: {
    duration: 400,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
};

// ============================================================================
// SPRING ANIMATIONS
// ============================================================================

/**
 * Default spring animation
 */
export const springDefault = (value: Animated.Value, toValue: number) =>
  Animated.spring(value, {
    toValue,
    ...springConfig.default,
  });

/**
 * Bouncy spring animation
 */
export const springBouncy = (value: Animated.Value, toValue: number) =>
  Animated.spring(value, {
    toValue,
    ...springConfig.bouncy,
  });

/**
 * Gentle spring animation
 */
export const springGentle = (value: Animated.Value, toValue: number) =>
  Animated.spring(value, {
    toValue,
    ...springConfig.gentle,
  });

/**
 * Snappy spring animation
 */
export const springSnappy = (value: Animated.Value, toValue: number) =>
  Animated.spring(value, {
    toValue,
    ...springConfig.snappy,
  });

// ============================================================================
// TIMING ANIMATIONS
// ============================================================================

/**
 * Fast timing animation
 */
export const timingFast = (value: Animated.Value, toValue: number) =>
  Animated.timing(value, {
    toValue,
    ...timingConfig.fast,
  });

/**
 * Normal timing animation
 */
export const timingNormal = (value: Animated.Value, toValue: number) =>
  Animated.timing(value, {
    toValue,
    ...timingConfig.normal,
  });

/**
 * Slow timing animation
 */
export const timingSlow = (value: Animated.Value, toValue: number) =>
  Animated.timing(value, {
    toValue,
    ...timingConfig.slow,
  });

// ============================================================================
// STAGGERED ANIMATIONS
// ============================================================================

/**
 * Calculate stagger delay for list items
 */
export const getStaggerDelay = (
  index: number,
  speed: 'fast' | 'normal' | 'slow' = 'normal'
) => index * animationConfig.stagger[speed];

/**
 * Create a staggered animation with delay
 */
export const staggeredAnimation = (
  value: Animated.Value,
  toValue: number,
  index: number,
  speed: 'fast' | 'normal' | 'slow' = 'normal'
) => {
  const delay = getStaggerDelay(index, speed);
  return Animated.sequence([
    Animated.delay(delay),
    springDefault(value, toValue),
  ]);
};

// ============================================================================
// ENTRANCE ANIMATIONS
// ============================================================================

/**
 * Fade in animation
 */
export const fadeIn = (
  opacity: Animated.Value,
  delay = 0
) => {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Fade in with slide up animation
 */
export const fadeInUp = (
  opacity: Animated.Value,
  translateY: Animated.Value,
  delay = 0
) => {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        ...springConfig.default,
      }),
    ]),
  ]);
};

/**
 * Fade in with scale animation
 */
export const fadeInScale = (
  opacity: Animated.Value,
  scale: Animated.Value,
  delay = 0
) => {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        ...springConfig.bouncy,
      }),
    ]),
  ]);
};

// ============================================================================
// PRESS ANIMATIONS
// ============================================================================

/**
 * Standard press scale animation
 */
export const pressIn = (scale: Animated.Value) => {
  return Animated.spring(scale, {
    toValue: scales.pressed,
    ...springConfig.snappy,
  });
};

/**
 * Standard press release animation
 */
export const pressOut = (scale: Animated.Value) => {
  return Animated.spring(scale, {
    toValue: 1,
    ...springConfig.default,
  });
};

/**
 * Soft press for cards
 */
export const pressInSoft = (scale: Animated.Value) => {
  return Animated.spring(scale, {
    toValue: scales.pressedSoft,
    ...springConfig.snappy,
  });
};

/**
 * Strong press for important actions
 */
export const pressInStrong = (scale: Animated.Value) => {
  return Animated.spring(scale, {
    toValue: scales.pressedStrong,
    ...springConfig.bouncy,
  });
};

// ============================================================================
// COMPLETION ANIMATIONS
// ============================================================================

/**
 * Success completion animation (scale bounce)
 */
export const completionBounce = (scale: Animated.Value) => {
  return Animated.sequence([
    Animated.spring(scale, {
      toValue: 1.15,
      ...springConfig.bouncy,
    }),
    Animated.spring(scale, {
      toValue: 1,
      ...springConfig.default,
    }),
  ]);
};

// ============================================================================
// PULSE & GLOW ANIMATIONS
// ============================================================================

/**
 * Continuous pulse animation
 */
export const startPulse = (scale: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.05,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Continuous glow opacity animation
 */
export const startGlow = (opacity: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.5,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

// ============================================================================
// NUMBER ANIMATION
// ============================================================================

/**
 * Animate number from current to target value
 */
export const animateNumber = (
  current: Animated.Value,
  target: number,
  duration = 600
) => {
  return Animated.timing(current, {
    toValue: target,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: false, // Can't use native driver for non-transform/opacity
  });
};

// ============================================================================
// HOOKS HELPERS
// ============================================================================

/**
 * Create press animation handlers
 */
export const createPressHandlers = (
  scale: Animated.Value,
  variant: 'default' | 'soft' | 'strong' = 'default'
) => {
  const handlePressIn = () => {
    switch (variant) {
      case 'soft':
        pressInSoft(scale).start();
        break;
      case 'strong':
        pressInStrong(scale).start();
        break;
      default:
        pressIn(scale).start();
    }
  };

  const handlePressOut = () => {
    pressOut(scale).start();
  };

  return { handlePressIn, handlePressOut };
};

/**
 * Create fade-in animation handlers
 */
export const createFadeInHandlers = (
  opacity: Animated.Value,
  translateY: Animated.Value,
  delay = 0
) => {
  const animate = () => {
    fadeInUp(opacity, translateY, delay).start();
  };

  return { animate };
};
