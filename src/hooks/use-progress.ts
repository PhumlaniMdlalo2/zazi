import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthUser } from '@/hooks/use-auth';
import {
  clearWrongExercise,
  fetchAllLessonProgress,
  fetchWrongExercises,
  recordLessonCompletion,
  recordWrongExercise,
} from '@/lib/progress-repository';

export function useLessonProgressMap() {
  const { user } = useAuthUser();
  return useQuery({
    queryKey: ['lessonProgress', user?.uid],
    queryFn: () => fetchAllLessonProgress(user!.uid),
    enabled: Boolean(user),
  });
}

/** Most-recently-wrong review queue (records only, ordered newest first). */
export function useWrongExercises() {
  const { user } = useAuthUser();
  return useQuery({
    queryKey: ['wrongExercises', user?.uid],
    queryFn: () => fetchWrongExercises(user!.uid),
    enabled: Boolean(user),
  });
}

export function useRecordWrongExercise() {
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId: string) => recordWrongExercise(user!.uid, exerciseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wrongExercises', user?.uid] }),
  });
}

export function useClearWrongExercise() {
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId: string) => clearWrongExercise(user!.uid, exerciseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wrongExercises', user?.uid] }),
  });
}

export function useCompleteLesson() {
  const { user } = useAuthUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, xpEarned, accuracy }: { lessonId: string; xpEarned: number; accuracy: number }) =>
      recordLessonCompletion(user!.uid, lessonId, xpEarned, accuracy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonProgress', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.uid] });
    },
  });
}
