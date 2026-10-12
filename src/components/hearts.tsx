import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HeartsProps = { count: number; max?: number; size?: number };

export function Hearts({ count, max = 5, size = 20 }: HeartsProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {Array.from({ length: max }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < count ? 'heart' : 'heart-outline'}
          size={size}
          color={i < count ? theme.heart : theme.textSecondary}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.half },
});
