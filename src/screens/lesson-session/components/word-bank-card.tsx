import { useImperativeHandle, useState, type Ref } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SpeakerButton } from '@/components/speaker-button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { exerciseAudioUrl } from '@/lib/audio';
import type { WordBankExercise } from '@/types/content';

export type WordBankCardHandle = { submit: () => void };

type Props = {
  exercise: WordBankExercise;
  onAnswered: (correct: boolean) => void;
  submitRef: Ref<WordBankCardHandle>;
};

type Token = { word: string; key: string };

export function WordBankCard({ exercise, onAnswered, submitRef }: Props) {
  const theme = useTheme();
  const [available, setAvailable] = useState<Token[]>(
    exercise.wordBank.map((word, i) => ({ word, key: `${word}-${i}` })),
  );
  const [selected, setSelected] = useState<Token[]>([]);
  const [revealed, setRevealed] = useState(false);
  const audioUrl = exerciseAudioUrl(exercise.id, exercise.audioUrl);

  function selectToken(token: Token) {
    if (revealed) return;
    setAvailable((prev) => prev.filter((t) => t.key !== token.key));
    setSelected((prev) => [...prev, token]);
  }

  function deselectToken(token: Token) {
    if (revealed) return;
    setSelected((prev) => prev.filter((t) => t.key !== token.key));
    setAvailable((prev) => [...prev, token]);
  }

  useImperativeHandle(submitRef, () => ({
    submit: () => {
      if (revealed || selected.length !== exercise.correctSequence.length) return;
      setRevealed(true);
      const correct = selected.every((t, i) => t.word.toLowerCase() === exercise.correctSequence[i].toLowerCase());
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
          <ThemedText type="title" style={styles.source}>
            {exercise.sourceText}
          </ThemedText>
        </View>
        {audioUrl && <SpeakerButton audioUrl={audioUrl} />}
      </View>

      <View style={[styles.answerRow, { borderColor: theme.border }]}>
        {selected.map((token) => (
          <Pressable
            key={token.key}
            onPress={() => deselectToken(token)}
            style={[styles.chip, { backgroundColor: theme.backgroundSelected }]}
          >
            <ThemedText type="smallBold">{token.word}</ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.bankRow}>
        {available.map((token) => (
          <Pressable
            key={token.key}
            onPress={() => selectToken(token)}
            style={[styles.chip, { backgroundColor: theme.backgroundElement }]}
          >
            <ThemedText type="smallBold">{token.word}</ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.four },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  promptWrap: { flex: 1 },
  source: { fontSize: 28 },
  answerRow: {
    minHeight: 56,
    borderBottomWidth: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  bankRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
});
