import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Hearts } from '@/components/hearts';
import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuthUser } from '@/hooks/use-auth';
import { useExercises, useExercisesByIds, useLesson } from '@/hooks/use-content';
import { useClearWrongExercise, useCompleteLesson, useRecordWrongExercise, useWrongExercises } from '@/hooks/use-progress';
import { useTheme } from '@/hooks/use-theme';
import { FeedbackBanner } from '@/screens/lesson-session/components/feedback-banner';
import { MatchPairsCard, type MatchPairsCardHandle } from '@/screens/lesson-session/components/match-pairs-card';
import { MultipleChoiceCard } from '@/screens/lesson-session/components/multiple-choice-card';
import { TranslateCard, type TranslateCardHandle } from '@/screens/lesson-session/components/translate-card';
import { WordBankCard, type WordBankCardHandle } from '@/screens/lesson-session/components/word-bank-card';
import { useSessionStore } from '@/store/session-store';
import type { Exercise } from '@/types/content';

function correctAnswerText(exercise: Exercise): string {
  switch (exercise.type) {
    case 'multiple_choice':
      return exercise.options[exercise.correctIndex];
    case 'translate':
      return exercise.acceptedAnswers[0];
    case 'word_bank':
      return exercise.correctSequence.join(' ');
    case 'match_pairs':
      return exercise.pairs.map((p) => `${p.left} – ${p.right}`).join(', ');
  }
}

type LessonSessionProps = {
  /** 'strengthen' skips lesson ownership/XP and instead replays the learner's
   *  most-recently-wrong exercises as a review session. */
  mode?: 'lesson' | 'strengthen';
};

export function LessonSession({ mode = 'lesson' }: LessonSessionProps) {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();

  const isStrengthen = mode === 'strengthen';
  const sessionKey = isStrengthen ? 'strengthen' : lessonId;
  const theme = useTheme();
  const { user } = useAuthUser();

  const { data: lesson } = useLesson(isStrengthen ? null : lessonId);

  const { data: wrongRecords } = useWrongExercises();
  const wrongIds = isStrengthen ? (wrongRecords ?? []).map((r) => r.exerciseId) : [];
  const strengthenExercises = useExercisesByIds(wrongIds, isStrengthen);
  const lessonExercises = useExercises(isStrengthen ? null : lessonId);
  const queryExercises = isStrengthen ? strengthenExercises.data : lessonExercises.data;
  const isLoading = isStrengthen ? strengthenExercises.isLoading : lessonExercises.isLoading;
  const completeLesson = useCompleteLesson();
  const recordWrong = useRecordWrongExercise();
  const clearWrong = useClearWrongExercise();

  const sessionLessonId = useSessionStore((s) => s.lessonId);
  const status = useSessionStore((s) => s.status);
  const currentIndex = useSessionStore((s) => s.currentIndex);
  const hearts = useSessionStore((s) => s.hearts);
  const correctCount = useSessionStore((s) => s.correctCount);
  const lastAnswerCorrect = useSessionStore((s) => s.lastAnswerCorrect);
  const sessionExercises = useSessionStore((s) => s.exercises);
  const start = useSessionStore((s) => s.start);
  const answer = useSessionStore((s) => s.answer);
  const advance = useSessionStore((s) => s.advance);

  const translateRef = useRef<TranslateCardHandle>(null);
  const wordBankRef = useRef<WordBankCardHandle>(null);
  const matchPairsRef = useRef<MatchPairsCardHandle>(null);

  useEffect(() => {
    if (queryExercises && queryExercises.length > 0 && sessionLessonId !== sessionKey) {
      start(sessionKey!, queryExercises);
    }
  }, [queryExercises, sessionLessonId, sessionKey, start]);

  useEffect(() => {
    if (
      !isStrengthen &&
      status === 'completed' &&
      lesson &&
      sessionExercises.length > 0 &&
      !completeLesson.isSuccess &&
      !completeLesson.isPending
    ) {
      completeLesson.mutate({
        lessonId,
        xpEarned: lesson.xpReward,
        accuracy: correctCount / sessionExercises.length,
      });
    }
  }, [status, lesson, sessionExercises.length, correctCount, lessonId, completeLesson, isStrengthen]);

  // Feed the Strengthen queue: mark missed exercises, clear them once correct so
  // the review set decays naturally.
  const activeExercise = sessionExercises[currentIndex];
  useEffect(() => {
    if (!user || !activeExercise || lastAnswerCorrect === null) return;
    if (lastAnswerCorrect) clearWrong.mutate(activeExercise.id);
    else recordWrong.mutate(activeExercise.id);
  }, [user, activeExercise, lastAnswerCorrect, clearWrong, recordWrong]);

  const ready = sessionLessonId === sessionKey || (!isLoading && !!queryExercises && queryExercises.length > 0);
  const sessionStarted = sessionLessonId === sessionKey;

  if (isStrengthen && !sessionStarted && wrongIds.length === 0 && !isLoading) {
    return (
      <ThemedView style={styles.center}>
        <SafeAreaView style={styles.resultContainer}>
          <Ionicons name="checkmark-done-circle" size={72} color={theme.secondary} />
          <ThemedText type="title" style={styles.centerText}>
            All caught up!
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            Nothing to strengthen right now.
          </ThemedText>
          <Button title="Back to Learn" onPress={() => router.replace('/(tabs)/learn')} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!ready) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={theme.primary} size="large" />
      </ThemedView>
    );
  }

  if (status === 'completed') {
    return (
      <ThemedView style={styles.center}>
        <SafeAreaView style={styles.resultContainer}>
          <Ionicons name="trophy" size={72} color={theme.secondary} />
          <ThemedText type="title" style={styles.centerText}>
            {isStrengthen ? 'Strengthened!' : 'Lesson Complete!'}
          </ThemedText>
          {!isStrengthen && (
            <ThemedText type="subtitle" themeColor="textSecondary">
              +{lesson?.xpReward ?? 0} XP
            </ThemedText>
          )}
          <ThemedText themeColor="textSecondary">
            {Math.round((correctCount / sessionExercises.length) * 100)}% correct
          </ThemedText>
          <Button title="Continue" onPress={() => router.replace('/(tabs)/learn')} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (status === 'failed') {
    return (
      <ThemedView style={styles.center}>
        <SafeAreaView style={styles.resultContainer}>
          <Ionicons name="heart-dislike" size={72} color={theme.danger} />
          <ThemedText type="title">Out of hearts!</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            Take another shot at {isStrengthen ? 'these exercises' : 'this lesson'}.
          </ThemedText>
          <Button title="Retry" onPress={() => queryExercises && start(sessionKey!, queryExercises)} />
          <Button title="Give Up" variant="outline" onPress={() => router.replace('/(tabs)/learn')} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const exercise = sessionExercises[currentIndex];
  const answered = lastAnswerCorrect !== null;

  function handleCheck() {
    if (exercise.type === 'translate') translateRef.current?.submit();
    if (exercise.type === 'word_bank') wordBankRef.current?.submit();
    if (exercise.type === 'match_pairs') matchPairsRef.current?.submit();
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.replace('/(tabs)/learn')} hitSlop={12}>
            <Ionicons name="close" size={28} color={theme.textSecondary} />
          </Pressable>
          <View style={styles.progressWrap}>
            <ProgressBar progress={currentIndex / sessionExercises.length} />
          </View>
          <Hearts count={hearts} />
        </View>

        <View style={styles.body}>
          {exercise.type === 'multiple_choice' && (
            <MultipleChoiceCard
              key={exercise.id}
              exercise={exercise}
              onAnswered={(correct) => answer(correct, 0)}
            />
          )}
          {exercise.type === 'translate' && (
            <TranslateCard
              key={exercise.id}
              exercise={exercise}
              onAnswered={(correct) => answer(correct, 0)}
              submitRef={translateRef}
            />
          )}
          {exercise.type === 'word_bank' && (
            <WordBankCard
              key={exercise.id}
              exercise={exercise}
              onAnswered={(correct) => answer(correct, 0)}
              submitRef={wordBankRef}
            />
          )}
          {exercise.type === 'match_pairs' && (
            <MatchPairsCard
              key={exercise.id}
              exercise={exercise}
              onAnswered={(correct) => answer(correct, 0)}
              submitRef={matchPairsRef}
            />
          )}
        </View>

        {!answered && (exercise.type === 'translate' || exercise.type === 'word_bank' || exercise.type === 'match_pairs') && (
          <View style={styles.checkBar}>
            <Button title="Check" onPress={handleCheck} />
          </View>
        )}
      </SafeAreaView>

      {answered && (
        <FeedbackBanner
          correct={Boolean(lastAnswerCorrect)}
          correctAnswerText={lastAnswerCorrect ? undefined : correctAnswerText(exercise)}
          onContinue={advance}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, gap: Spacing.five },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  resultContainer: { alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.four },
  centerText: { textAlign: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  progressWrap: { flex: 1 },
  body: { flex: 1, paddingHorizontal: Spacing.four },
  checkBar: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
});
