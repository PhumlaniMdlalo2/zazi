import { useImperativeHandle, useState, type Ref } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SpeakerButton } from '@/components/speaker-button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { exerciseAudioUrl } from '@/lib/audio';
import type { MatchPairsExercise } from '@/types/content';

export type MatchPairsCardHandle = { submit: () => void };

type Props = {
  exercise: MatchPairsExercise;
  onAnswered: (correct: boolean) => void;
  submitRef: Ref<MatchPairsCardHandle>;
};

type RightItem = { word: string; pairIndex: number };

function shuffled(source: RightItem[]): RightItem[] {
  const result = [...source];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function MatchPairsCard({ exercise, onAnswered, submitRef }: Props) {
  const theme = useTheme();
  const [leftSelected, setLeftSelected] = useState<number | null>(null);
  const [rightItems] = useState<RightItem[]>(() =>
    shuffled(exercise.pairs.map((p, i) => ({ word: p.right, pairIndex: i }))),
  );
  const [connections, setConnections] = useState<{ leftIndex: number; rightSlot: number }[]>([]);
  const [revealed, setRevealed] = useState(false);
  const audioUrl = exerciseAudioUrl(exercise.id, exercise.audioUrl);

  function isLeftMatched(leftIndex: number): boolean {
    return connections.some((c) => c.leftIndex === leftIndex);
  }

  function isRightMatched(rightSlot: number): boolean {
    return connections.some((c) => c.rightSlot === rightSlot);
  }

  function handleLeftPress(leftIndex: number) {
    if (revealed) return;
    if (isLeftMatched(leftIndex)) {
      setConnections((prev) => prev.filter((c) => c.leftIndex !== leftIndex));
      setLeftSelected(null);
      return;
    }
    if (leftSelected === leftIndex) {
      setLeftSelected(null);
      return;
    }
    setLeftSelected(leftIndex);
  }

  function handleRightPress(rightSlot: number) {
    if (revealed) return;
    if (isRightMatched(rightSlot)) {
      setConnections((prev) => prev.filter((c) => c.rightSlot !== rightSlot));
      setLeftSelected(null);
      return;
    }
    if (leftSelected === null) return;
    setConnections((prev) => [...prev, { leftIndex: leftSelected, rightSlot }]);
    setLeftSelected(null);
  }

  useImperativeHandle(submitRef, () => ({
    submit: () => {
      if (revealed || connections.length !== exercise.pairs.length) return;
      setRevealed(true);
      const correct = connections.every(
        (c) => rightItems[c.rightSlot].pairIndex === c.leftIndex,
      );
      onAnswered(correct);
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.promptWrap}>
          <ThemedText type="small" themeColor="textSecondary">
            {exercise.prompt}
          </ThemedText>
        </View>
        {audioUrl && <SpeakerButton audioUrl={audioUrl} />}
      </View>

      <View style={styles.columns}>
        <View style={styles.column}>
          {exercise.pairs.map((pair, leftIndex) => {
            const connection = connections.find((c) => c.leftIndex === leftIndex);
            const matched = connection !== undefined;
            const isSelected = leftSelected === leftIndex;

            let borderColor: string = theme.border;
            let backgroundColor: string = theme.backgroundElement;
            if (revealed && connection) {
              if (rightItems[connection.rightSlot].pairIndex === leftIndex) {
                borderColor = theme.success;
                backgroundColor = theme.backgroundSelected;
              } else {
                borderColor = theme.danger;
              }
            } else if (matched) {
              borderColor = theme.primary;
            } else if (isSelected) {
              borderColor = theme.secondary;
              backgroundColor = theme.backgroundSelected;
            }

            return (
              <Pressable
                key={`left-${pair.left}`}
                onPress={() => handleLeftPress(leftIndex)}
                disabled={revealed}
                style={[styles.item, { borderColor, backgroundColor }]}
              >
                <ThemedText type="smallBold">{pair.left}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.column}>
          {rightItems.map((item, rightSlot) => {
            const matched = isRightMatched(rightSlot);

            let borderColor: string = theme.border;
            let backgroundColor: string = theme.backgroundElement;
            if (revealed) {
              const connection = connections.find((c) => c.rightSlot === rightSlot);
              if (connection && rightItems[connection.rightSlot].pairIndex === connection.leftIndex) {
                borderColor = theme.success;
                backgroundColor = theme.backgroundSelected;
              } else if (connection) {
                borderColor = theme.danger;
              }
            } else if (matched) {
              borderColor = theme.primary;
            }

            return (
              <Pressable
                key={`right-${item.word}`}
                onPress={() => handleRightPress(rightSlot)}
                disabled={revealed}
                style={[styles.item, { borderColor, backgroundColor }]}
              >
                <ThemedText type="smallBold">{item.word}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.four },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  promptWrap: { flex: 1 },
  columns: { flexDirection: 'row', gap: Spacing.three },
  column: { flex: 1, gap: Spacing.two },
  item: {
    minHeight: 48,
    borderWidth: 2,
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});