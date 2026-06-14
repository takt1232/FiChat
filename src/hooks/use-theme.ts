import { Colors, Shadows, type ThemeColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return {
    ...Colors[theme],
    shadow: Shadows.card,
    shadowElevated: Shadows.elevated,
    shadowFab: Shadows.fab,
  };
}

export type Theme = ReturnType<typeof useTheme>;
