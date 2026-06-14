import { Colors, Shadows, type ThemeColor } from '@/constants/theme';
import { useThemeMode } from '@/context/ThemeContext';

export function useTheme() {
  const { theme } = useThemeMode();

  return {
    ...Colors[theme],
    shadow: Shadows.card,
    shadowElevated: Shadows.elevated,
    shadowFab: Shadows.fab,
  };
}

export type Theme = ReturnType<typeof useTheme>;
