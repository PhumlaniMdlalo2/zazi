import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  correct: boolean;
  correctAnswerText?: string;
  onContinue: () => void;
};

export function FeedbackBanner({ correct, correctAnswerText, onContinue }: Props) {
  const theme = useTheme();
  const backgroundColor = correct ? theme.backgroundSelected : theme.backgroundElement;
  const accent = correct ? theme.success : theme.danger;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <View style={styles.messageRow}>
          <Ionicons name={correct ? 'checkmark-circle' : 'close-circle'} size={28} color={accent} />
          <View style={styles.textCol}>
            <ThemedText type="smallBold" style={{ color: accent }}>
              {correct ? 'Nice!' : 'Not quite'}
            </ThemedText>
            {!correct && correctAnswerText && (
              <ThemedText type="small" themeColor="textSecondary">
                Correct answer: {correctAnswerText}
              </ThemedText>
            )}
          </View>
        </View>
        <Button title="Continue" variant={correct ? 'primary' : 'danger'} onPress={onContinue} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  safeArea: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: Spacing.three },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  textCol: { flex: 1, gap: 2 },
});
