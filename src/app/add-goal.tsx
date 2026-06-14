import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/card';
import { Spacing, Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useGoals } from '@/hooks/use-goals';

const GOAL_ICONS = [
  { icon: '🎯', color: '#3498DB' },
  { icon: '🏠', color: '#E74C3C' },
  { icon: '🚗', color: '#2ECC71' },
  { icon: '✈️', color: '#F39C12' },
  { icon: '🎓', color: '#9B59B6' },
  { icon: '💻', color: '#1ABC9C' },
  { icon: '🏋️', color: '#E67E22' },
  { icon: '💰', color: '#27AE60' },
];

export default function AddGoalScreen() {
  const theme = useTheme();
  const { create } = useGoals();

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selected, setSelected] = useState(GOAL_ICONS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const targetAmount = parseFloat(target);
    if (!name.trim() || !targetAmount || targetAmount <= 0) return;
    setSaving(true);
    try {
      await create({
        name: name.trim(),
        target_amount: targetAmount,
        icon: selected.icon,
        color: selected.color,
        deadline: deadline || null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }, [name, target, deadline, selected, create]);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card>
          <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
            GOAL NAME
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.border, color: theme.text }]}
            placeholder="e.g. New Laptop"
            placeholderTextColor={theme.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </Card>

        <Card>
          <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
            TARGET AMOUNT
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.border, color: theme.text }]}
            placeholder="0.00"
            placeholderTextColor={theme.textTertiary}
            keyboardType="decimal-pad"
            value={target}
            onChangeText={setTarget}
          />
        </Card>

        <Card>
          <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
            DEADLINE (OPTIONAL)
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.border, color: theme.text }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textTertiary}
            value={deadline}
            onChangeText={setDeadline}
          />
        </Card>

        <Card>
          <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
            ICON
          </ThemedText>
          <View style={styles.chipRow}>
            {GOAL_ICONS.map((g) => (
              <Pressable
                key={g.icon}
                onPress={() => setSelected(g)}
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor: selected.icon === g.icon ? g.color : theme.border,
                  },
                ]}
              >
                <ThemedText style={styles.iconEmoji}>{g.icon}</ThemedText>
              </Pressable>
            ))}
          </View>
        </Card>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.saveBtn,
            { backgroundColor: theme.accent, opacity: saving ? 0.5 : 1 },
          ]}
        >
          <ThemedText type="smallBold" style={styles.saveText}>
            {saving ? 'Saving...' : 'Save Goal'}
          </ThemedText>
        </Pressable>
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
  label: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  input: {
    fontSize: 15,
    padding: Spacing.lg,
    borderRadius: Radii.input,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: Radii.icon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 22 },
  saveBtn: {
    paddingVertical: Spacing.lg,
    borderRadius: Radii.button,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
