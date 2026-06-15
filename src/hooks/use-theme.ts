import { Colors, type ThemeColor } from '@/constants/theme';
import { useThemeMode } from '@/context/ThemeContext';

export function useTheme() {
  const { theme } = useThemeMode();

  return {
    ...Colors[theme],
  };
}

export type Theme = ReturnType<typeof useTheme>;
