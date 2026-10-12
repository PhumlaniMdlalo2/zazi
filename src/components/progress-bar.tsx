import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProgressBarProps = { progress: number; color?: string; height?: number };

export function ProgressBar({ progress, color, height = 12 }: ProgressBarProps) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { height, backgroundColor: theme.backgroundElement }]}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color ?? theme.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden', borderRadius: Radius.pill },
  fill: { height: '100%', borderRadius: Radius.pill },
});
