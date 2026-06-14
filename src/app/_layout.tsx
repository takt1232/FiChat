import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { migrateDbIfNeeded } from '@/db/database';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <SQLiteProvider databaseName="fichat.db" onInit={migrateDbIfNeeded}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
    </SQLiteProvider>
  );
}
