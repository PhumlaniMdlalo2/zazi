import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_LANGUAGE_ID } from '@/constants/app';
import { Spacing } from '@/constants/theme';
import { useUserProfile } from '@/hooks/use-auth';
import { useLessonProgressMap, useWrongExercises } from '@/hooks/use-progress';
import { useTheme } from '@/hooks/use-theme';
import { useLearnPath } from '@/hooks/use-content';
import { LessonNode, type LessonNodeState } from '@/screens/learn/lesson-node';
import { UnitBanner } from '@/screens/learn/unit-banner';

function snakeOffset(index: number) {
  return Math.round(Math.sin(index * 0.9) * 60);
}

export function Learn() {
  const theme = useTheme();
  const router = useRouter();
  const { data: path, isLoading, error } = useLearnPath(DEFAULT_LANGUAGE_ID);
  const { data: progressMap } = useLessonProgressMap();
  const { data: profile } = useUserProfile();
  const { data: wrongExercises } = useWrongExercises();
  const strengthenCount = wrongExercises?.length ?? 0;

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={theme.primary} size="large" />
      </ThemedView>
    );
  }

  if (error || !path || path.units.length === 0) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="smallBold" style={styles.centerText}>
          {error
            ? 'Could not load lessons.'
            : 'No content yet — after configuring Firebase, run `npm run seed`.'}
        </ThemedText>
      </ThemedView>
    );
  }

  const flatLessons = path.units.flatMap((unit) =>
    path.lessonsByUnit[unit.id].map((lesson) => ({ unit, lesson })),
  );

  const lessonMeta = new Map<string, { state: LessonNodeState; index: number }>();
  flatLessons.forEach(({ lesson }, index) => {
    const completed = Boolean(progressMap?.[lesson.id]?.completed);
    const previousId = flatLessons[index - 1]?.lesson.id;
    const unlocked = index === 0 || Boolean(previousId && progressMap?.[previousId]?.completed);
    lessonMeta.set(lesson.id, { state: completed ? 'completed' : unlocked ? 'available' : 'locked', index });
  });

  function openLesson(lessonId: string, state: LessonNodeState, hasTips: boolean) {
    // First-time lessons with grammar tips get the short "teach" screen first.
    if (state === 'available' && hasTips) router.push(`/teach/${lessonId}`);
    else router.push(`/lesson/${lessonId}`);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={[styles.statBadge, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="flame" size={20} color={theme.streak} />
            <ThemedText type="smallBold">{profile?.streak ?? 0}</ThemedText>
          </View>
          <View style={[styles.statBadge, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="star" size={20} color={theme.xp} />
            <ThemedText type="smallBold">{profile?.xp ?? 0} XP</ThemedText>
          </View>
        </View>

        {strengthenCount > 0 && (
          <View style={styles.strengthenWrap}>
            <Button
              title={`Strengthen ${strengthenCount > 0 ? `(${strengthenCount})` : ''}`}
              variant="secondary"
              onPress={() => router.push('/strengthen')}
            />
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {path.units.map((unit) => (
            <View key={unit.id} style={styles.unitSection}>
              <UnitBanner unit={unit} />
              <View style={styles.path}>
                {path.lessonsByUnit[unit.id].map((lesson) => {
                  const meta = lessonMeta.get(lesson.id)!;
                  return (
                    <LessonNode
                      key={lesson.id}
                      state={meta.state}
                      unitTheme={unit.theme}
                      offset={snakeOffset(meta.index)}
                      onPress={() =>
                        openLesson(lesson.id, meta.state, Boolean(lesson.grammarTips?.length))
                      }
                    />
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  centerText: { textAlign: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  strengthenWrap: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.two },
  scrollContent: { paddingBottom: Spacing.six, paddingHorizontal: Spacing.four, gap: Spacing.five },
  unitSection: { gap: Spacing.four, alignItems: 'center' },
  path: { alignItems: 'center', gap: Spacing.four },
});
