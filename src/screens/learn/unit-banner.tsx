import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UNIT_THEME_TOKENS } from '@/constants/app';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Unit } from '@/types/content';

export function UnitBanner({ unit }: { unit: Unit }) {
  const theme = useTheme();
  const tokens = UNIT_THEME_TOKENS[unit.theme];

  return (
    <View style={[styles.card, { backgroundColor: theme[tokens.face] }]}>
      <ThemedText style={styles.title}>{unit.title}</ThemedText>
      <ThemedText style={styles.description}>{unit.description}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.half,
  },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  description: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
});
