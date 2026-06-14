import { Stack, router } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import { ThemeProvider as AppThemeProvider, useThemeMode } from '@/context/ThemeContext';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { migrateDbIfNeeded } from '@/db/database';
import { requestPermissions, addNotificationResponseListener } from '@/services/notifications';

function RootLayoutInner() {
  const { theme } = useThemeMode();

  useEffect(() => {
    requestPermissions();
    const sub = addNotificationResponseListener((recurringId) => {
      router.push(`/add-transaction?recurringId=${recurringId}`);
    });
    return () => sub.remove();
  }, []);

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
          name="add-income"
          options={{ presentation: 'modal', title: 'Add Income' }}
        />
        <Stack.Screen
          name="add-expense"
          options={{ presentation: 'modal', title: 'Add Expense' }}
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
          name="add-recurring"
          options={{ presentation: 'modal', title: 'Add Recurring' }}
        />
        <Stack.Screen
          name="edit-transaction/[id]"
          options={{ presentation: 'modal', title: 'Edit Transaction' }}
        />
        <Stack.Screen
          name="edit-account/[id]"
          options={{ presentation: 'modal', title: 'Edit Account' }}
        />
        <Stack.Screen
          name="edit-recurring/[id]"
          options={{ presentation: 'modal', title: 'Edit Recurring' }}
        />
        <Stack.Screen
          name="account/[id]"
          options={{ title: 'Account' }}
        />
        <Stack.Screen
          name="goal/[id]"
          options={{ title: 'Goal' }}
        />
        <Stack.Screen
          name="history"
          options={{ presentation: 'modal', title: 'Transaction History' }}
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
