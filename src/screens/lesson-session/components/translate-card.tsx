import { useImperativeHandle, useState, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';

import { SpeakerButton } from '@/components/speaker-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { exerciseAudioUrl } from '@/lib/audio';
import type { TranslateExercise } from '@/types/content';

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export type TranslateCardHandle = { submit: () => void };

type Props = {
  exercise: TranslateExercise;
  onAnswered: (correct: boolean) => void;
  submitRef: Ref<TranslateCardHandle>;
};

export function TranslateCard({ exercise, onAnswered, submitRef }: Props) {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [revealed, setRevealed] = useState(false);
  const audioUrl = exerciseAudioUrl(exercise.id, exercise.audioUrl);

  useImperativeHandle(submitRef, () => ({
    submit: () => {
      if (revealed || normalize(value).length === 0) return;
      setRevealed(true);
      onAnswered(exercise.acceptedAnswers.some((answer) => normalize(answer) === normalize(value)));
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

      <TextField
        placeholder="Type your answer"
        value={value}
        onChangeText={setValue}
        editable={!revealed}
        autoCapitalize="none"
        autoCorrect={false}
        style={revealed ? { borderColor: theme.border, opacity: 0.7 } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.four },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  promptWrap: { flex: 1 },
  source: { fontSize: 28 },
});
