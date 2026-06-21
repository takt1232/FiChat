import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header } from '@/components/header';
import { RecurringCard } from '@/components/recurring-card';
import { SectionHeader } from '@/components/section-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RecurringRow, useRecurring } from '@/hooks/use-recurring';

export default function RecurringScreen() {
  const theme = useTheme();
  const { list } = useRecurring();
  const [recurrings, setRecurrings] = useState<RecurringRow[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      list().then(setRecurrings);
    }, [list]),
  );

  const active = recurrings.filter((r) => r.is_active);
  const inactive = recurrings.filter((r) => !r.is_active);

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: 'Recurring' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />
        <Pressable
          style={[styles.addBtn, { backgroundColor: theme.accent }]}
          onPress={() => router.push('/add-recurring')}
        >
          <ThemedText type="smallBold" style={styles.addBtnText}>
            + New Recurring
          </ThemedText>
        </Pressable>

        {!bannerDismissed && (
          <View
            style={[
              styles.bannerCard,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <View style={styles.bannerHeader}>
              <View style={styles.bannerContent}>
                <ThemedText type="smallBold">
                  Notifications may not work when app is closed
                </ThemedText>
                <ThemedText
                  type="small"
                  style={[styles.bannerDesc, { color: theme.textSecondary }]}
                >
                  To receive reminders reliably, disable battery optimization
                  for Fichat in system settings.
                </ThemedText>
              </View>
              <Pressable
                onPress={() => setBannerDismissed(true)}
                hitSlop={8}
              >
                <ThemedText
                  type="small"
                  style={{ color: theme.textTertiary }}
                >
                  ✕
                </ThemedText>
              </Pressable>
            </View>
            <Pressable
              style={[styles.bannerBtn, { backgroundColor: theme.accent }]}
              onPress={() => Linking.openSettings()}
            >
              <ThemedText type="smallBold" style={styles.bannerBtnText}>
                Open App Settings
              </ThemedText>
            </Pressable>
          </View>
        )}

        {recurrings.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText type="default" style={{ color: theme.textSecondary }}>
              No recurring transactions yet.
            </ThemedText>
          </View>
        ) : (
          <>
            {active.length > 0 && (
              <View style={styles.section}>
                <SectionHeader label={`Active (${active.length})`} />
                <View style={styles.list}>
                  {active.map((r) => (
                    <RecurringCard
                      key={r.id}
                      recurring={r}
                      onPress={() => router.push(`/edit-recurring/${r.id}`)}
                    />
                  ))}
                </View>
              </View>
            )}

            {inactive.length > 0 && (
              <View style={styles.section}>
                <SectionHeader label={`Inactive (${inactive.length})`} />
                <View style={styles.list}>
                  {inactive.map((r) => (
                    <RecurringCard
                      key={r.id}
                      recurring={r}
                      onPress={() => router.push(`/edit-recurring/${r.id}`)}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  addBtn: {
    paddingVertical: Spacing.md,
    borderRadius: 999,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  bannerCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.md,
  },
  bannerHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  bannerContent: {
    flex: 1,
    gap: Spacing.two,
  },
  bannerDesc: {
    lineHeight: 18,
  },
  bannerBtn: {
    paddingVertical: Spacing.md,
    borderRadius: 999,
    alignItems: 'center',
  },
  bannerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  section: {
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.sm,
  },
  empty: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
});
