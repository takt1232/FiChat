import '@/global.css';

import { Platform } from 'react-native';

export const Accent = '#00C4B4';

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#F5F5F0',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#FAFAF8',
    card: '#FFFFFF',
    cardSelected: '#FAFAF8',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',
    border: '#F0F0ED',
    shadow: 'rgba(0,0,0,0.06)',
    accent: Accent,
    income: Accent,
    expense: '#1A1A1A',
  },
  dark: {
    text: '#FFFFFF',
    background: '#1C1C1E',
    backgroundElement: '#2C2C2E',
    backgroundSelected: '#3A3A3C',
    card: '#2C2C2E',
    cardSelected: '#3A3A3C',
    textSecondary: '#8E8E93',
    textTertiary: '#636366',
    border: '#38383A',
    shadow: 'rgba(0,0,0,0.3)',
    accent: '#00D4C4',
    income: '#00D4C4',
    expense: '#FFFFFF',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Radii = {
  card: 16,
  button: 999,
  icon: 12,
  input: 16,
  progress: 999,
} as const;

export const Shadows = Platform.select({
  ios: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
    },
    fab: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
  },
  android: {
    card: { elevation: 2 },
    elevated: { elevation: 6 },
    fab: { elevation: 8 },
  },
  web: {
    card: {
      shadowColor: 'rgba(0,0,0,0.06)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 12,
    },
    elevated: {
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 16,
    },
    fab: {
      shadowColor: 'rgba(0,0,0,0.15)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
    },
  },
}) as Record<string, any>;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  xs: 4,
  two: 8,
  sm: 8,
  md: 12,
  three: 16,
  lg: 16,
  xl: 20,
  four: 24,
  xxl: 24,
  five: 32,
  xxxl: 32,
  six: 64,
  huge: 48,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
