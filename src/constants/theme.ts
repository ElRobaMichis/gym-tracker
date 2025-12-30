import { TextStyle, ViewStyle } from 'react-native';

// ============================================================================
// OBSIDIAN FORGE - Premium Dark Fitness Design System
// ============================================================================

export const colors = {
  light: {
    // Backgrounds
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    surfaceElevated: '#FFFFFF',

    // Primary - Electric Indigo
    primary: '#4F46E5',
    primaryVariant: '#6366F1',
    primaryMuted: 'rgba(79, 70, 229, 0.12)',

    // Secondary - Emerald Power
    secondary: '#059669',
    secondaryVariant: '#10B981',
    secondaryMuted: 'rgba(5, 150, 105, 0.12)',

    // Accent - Amber Fire (for PRs and highlights)
    accent: '#D97706',
    accentVariant: '#F59E0B',
    accentMuted: 'rgba(217, 119, 6, 0.12)',

    // Semantic
    error: '#DC2626',
    errorMuted: 'rgba(220, 38, 38, 0.12)',
    warning: '#D97706',
    success: '#059669',

    // Text Hierarchy
    text: '#111827',
    textSecondary: '#4B5563',
    textTertiary: '#9CA3AF',
    textDisabled: '#D1D5DB',
    textInverse: '#FFFFFF',

    // Borders & Dividers
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    divider: 'rgba(0, 0, 0, 0.06)',

    // Cards
    card: '#FFFFFF',
    cardHover: '#F9FAFB',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',

    // Workout-specific
    warmup: '#FEF3C7',
    warmupText: '#92400E',
    completed: 'rgba(5, 150, 105, 0.15)',
    completedBorder: '#059669',
    pr: 'rgba(217, 119, 6, 0.15)',
    prBorder: '#D97706',
    successLight: '#D1FAE5',

    // Glass effect
    glass: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
  },

  dark: {
    // Deep, rich backgrounds - the "obsidian" foundation
    background: '#08080C',
    surface: '#0F0F14',
    surfaceVariant: '#16161E',
    surfaceElevated: '#1C1C26',

    // Primary - Electric Indigo with glow potential
    primary: '#6366F1',
    primaryVariant: '#818CF8',
    primaryMuted: 'rgba(99, 102, 241, 0.15)',

    // Secondary - Emerald Power for completion/success
    secondary: '#10B981',
    secondaryVariant: '#34D399',
    secondaryMuted: 'rgba(16, 185, 129, 0.15)',

    // Accent - Amber Fire for PRs and achievements
    accent: '#F59E0B',
    accentVariant: '#FBBF24',
    accentMuted: 'rgba(245, 158, 11, 0.15)',

    // Semantic colors
    error: '#EF4444',
    errorMuted: 'rgba(239, 68, 68, 0.15)',
    warning: '#F59E0B',
    success: '#10B981',

    // Text hierarchy with high contrast
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    textDisabled: '#475569',
    textInverse: '#08080C',

    // Subtle borders that glow with content
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',
    divider: 'rgba(255, 255, 255, 0.05)',

    // Cards with depth
    card: '#0F0F14',
    cardHover: '#16161E',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.75)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',

    // Workout-specific with premium feel
    warmup: 'rgba(245, 158, 11, 0.12)',
    warmupText: '#FCD34D',
    completed: 'rgba(16, 185, 129, 0.15)',
    completedBorder: '#10B981',
    pr: 'rgba(245, 158, 11, 0.2)',
    prBorder: '#F59E0B',
    successLight: 'rgba(16, 185, 129, 0.2)',

    // Glass morphism
    glass: 'rgba(15, 15, 20, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

// Extended spacing scale for better rhythm
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Extended border radius with more options
export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
};

// Typography scale
export const fontSize = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const fontWeight: Record<string, TextStyle['fontWeight']> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
};

// Letter spacing for different contexts
export const letterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
};

// Shadow system with glow variants
export const shadows: Record<string, ViewStyle> = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Glow effects for premium interactions
export const glows = {
  primary: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  secondary: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  accent: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  error: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
};

// Animation timing presets
export const animationConfig = {
  // Spring configurations
  spring: {
    default: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
    bouncy: {
      damping: 12,
      stiffness: 180,
      mass: 0.8,
    },
    gentle: {
      damping: 20,
      stiffness: 120,
      mass: 1,
    },
    snappy: {
      damping: 18,
      stiffness: 250,
      mass: 0.6,
    },
  },
  // Timing durations in ms
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
    verySlow: 600,
  },
  // Stagger delays for list animations
  stagger: {
    fast: 30,
    normal: 50,
    slow: 80,
  },
};

// Common scale values for press feedback
export const scales = {
  pressed: 0.97,
  pressedSoft: 0.985,
  pressedStrong: 0.94,
  hover: 1.02,
};
