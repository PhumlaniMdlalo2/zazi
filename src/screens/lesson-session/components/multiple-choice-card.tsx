import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SpeakerButton } from '@/components/speaker-button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { exerciseAudioUrl } from '@/lib/audio';
import type { MultipleChoiceExercise } from '@/types/content';

type Props = { exercise: MultipleChoiceExercise; onAnswered: (correct: boolean) => void };

export function MultipleChoiceCard({ exercise, onAnswered }: Props) {
  const theme = useTheme();
  const [selected, setSelected] = useState<number | null>(null);
  const audioUrl = exerciseAudioUrl(exercise.id, exercise.audioUrl);

  function handleSelect(index: number) {
    if (selected !== null) return;
    setSelected(index);
    onAnswered(index === exercise.correctIndex);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.promptWrap}>
          <ThemedText type="small" themeColor="textSecondary">
            {exercise.prompt}
          </ThemedText>
          <ThemedText type="title" style={styles.question}>
            {exercise.question}
          </ThemedText>
        </View>
        {audioUrl && <SpeakerButton audioUrl={audioUrl} />}
      </View>

      <View style={styles.options}>
        {exercise.options.map((option, index) => {
          const isCorrect = index === exercise.correctIndex;
          const isSelected = index === selected;
          const revealed = selected !== null;

          let borderColor: string = theme.border;
          let backgroundColor: string = theme.backgroundElement;
          if (revealed && isCorrect) {
            borderColor = theme.success;
            backgroundColor = theme.backgroundSelected;
          } else if (revealed && isSelected && !isCorrect) {
            borderColor = theme.danger;
          }

          return (
            <Pressable
              key={option}
              onPress={() => handleSelect(index)}
              disabled={revealed}
              style={[styles.option, { borderColor, backgroundColor }]}
            >
              <ThemedText type="smallBold">{option}</ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.four },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  promptWrap: { flex: 1 },
  question: { fontSize: 32 },
  options: { gap: Spacing.three },
  option: {
    borderWidth: 2,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
});
