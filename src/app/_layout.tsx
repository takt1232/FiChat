import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider as AppThemeProvider, useThemeMode } from '@/context/ThemeContext';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { migrateDbIfNeeded } from '@/db/database';

function RootLayoutInner() {
  const { theme } = useThemeMode();

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-transaction"
          options={{ presentation: 'modal', title: 'Add Transaction' }}
        />
        <Stack.Screen
          name="add-account"
          options={{ presentation: 'modal', title: 'Add Account' }}
        />
        <Stack.Screen
          name="add-goal"
          options={{ presentation: 'modal', title: 'Add Goal' }}
        />
        <Stack.Screen
          name="account/[id]"
          options={{ title: 'Account' }}
        />
        <Stack.Screen
          name="goal/[id]"
          options={{ title: 'Goal' }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="fichat.db" onInit={migrateDbIfNeeded}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <RootLayoutInner />
        </AppThemeProvider>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}
