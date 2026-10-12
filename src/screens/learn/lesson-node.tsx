import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { UNIT_THEME_TOKENS } from '@/constants/app';
import { PressDepth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { UnitTheme } from '@/types/content';

const SIZE = 64;

export type LessonNodeState = 'locked' | 'available' | 'completed';

type LessonNodeProps = {
  state: LessonNodeState;
  unitTheme: UnitTheme;
  offset: number;
  onPress: () => void;
};

export function LessonNode({ state, unitTheme, offset, onPress }: LessonNodeProps) {
  const theme = useTheme();
  const locked = state === 'locked';
  const tokens = UNIT_THEME_TOKENS[unitTheme];

  const face = locked ? theme.backgroundElement : theme[tokens.face];
  const shadow = locked ? theme.border : theme[tokens.shadow];
  const icon = state === 'completed' ? 'checkmark' : state === 'available' ? 'star' : 'lock-closed';
  const iconColor = locked ? theme.textSecondary : '#FFFFFF';

  return (
    <Pressable onPress={onPress} disabled={locked} style={[styles.wrapper, { marginLeft: offset }]}>
      {({ pressed }) => (
        <View style={[styles.shadow, { backgroundColor: shadow }]}>
          <View
            style={[
              styles.face,
              {
                backgroundColor: face,
                marginBottom: pressed && !locked ? 0 : PressDepth,
                transform: [{ translateY: pressed && !locked ? PressDepth : 0 }],
              },
            ]}
          >
            <Ionicons name={icon} size={28} color={iconColor} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: SIZE },
  shadow: { width: SIZE, height: SIZE, borderRadius: SIZE },
  face: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
