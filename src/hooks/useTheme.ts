import { useColorScheme } from 'react-native';
import {
  colors,
  shadows,
  glows,
  animationConfig,
  scales,
} from '../constants/theme';
import { useAppSelector } from './useStore';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const userTheme = useAppSelector(state => state.user.user.settings.theme);

  const colorScheme =
    userTheme === 'system' ? systemColorScheme || 'light' : userTheme;

  return {
    colors: colors[colorScheme],
    isDark: colorScheme === 'dark',
    shadows,
    glows,
    animationConfig,
    scales,
  };
}

// Type exports for convenience
export type ThemeColors = typeof colors.dark;
export type ThemeShadows = typeof shadows;
export type ThemeGlows = typeof glows;
