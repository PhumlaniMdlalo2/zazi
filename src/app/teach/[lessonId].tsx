import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useLesson } from '@/hooks/use-content';
import { useTheme } from '@/hooks/use-theme';

export default function TeachScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { data: lesson, isLoading } = useLesson(lessonId);

  if (isLoading || !lesson) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={theme.primary} size="large" />
      </ThemedView>
    );
  }

  const tips = lesson.grammarTips ?? [];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={28} color={theme.textSecondary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="subtitle">{lesson.title}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.lead}>
            A quick look at the grammar before you start.
          </ThemedText>

          {tips.length === 0 && (
            <ThemedText themeColor="textSecondary">No tips for this lesson yet.</ThemedText>
          )}

          {tips.map((tip, i) => (
            <View key={tip.title} style={[styles.tipCard, { backgroundColor: theme.backgroundElement }]}>
              <View style={[styles.tipNumber, { backgroundColor: theme.primary }]}>
                <ThemedText style={styles.tipNumberText}>{i + 1}</ThemedText>
              </View>
              <View style={styles.tipBody}>
                <ThemedText type="smallBold">{tip.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.tipText}>
                  {tip.body}
                </ThemedText>
                {tip.examples.map((ex) => (
                  <View key={`${ex.xhosa}-${ex.english}`} style={styles.exampleRow}>
                    <ThemedText type="code">{ex.xhosa}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {ex.english}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Start" onPress={() => router.replace(`/lesson/${lessonId}`)} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four, gap: Spacing.three },
  lead: { marginBottom: Spacing.two },
  tipCard: {
    flexDirection: 'row',
    gap: Spacing.three,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipNumberText: { color: '#FFFFFF', fontWeight: '800' },
  tipBody: { flex: 1, gap: Spacing.one },
  tipText: { marginBottom: Spacing.one },
  exampleRow: { gap: 2, marginBottom: Spacing.one },
  footer: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
});