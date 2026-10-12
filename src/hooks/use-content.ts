import { useQuery } from '@tanstack/react-query';

import {
  fetchExercises,
  fetchExercisesByIds,
  fetchLearnPath,
  fetchLesson,
  fetchLessons,
  fetchUnits,
} from '@/lib/content-repository';

export function useLearnPath(languageId: string) {
  return useQuery({ queryKey: ['learnPath', languageId], queryFn: () => fetchLearnPath(languageId) });
}

export function useUnits(languageId: string) {
  return useQuery({ queryKey: ['units', languageId], queryFn: () => fetchUnits(languageId) });
}

export function useLessons(unitId: string) {
  return useQuery({ queryKey: ['lessons', unitId], queryFn: () => fetchLessons(unitId) });
}

export function useLesson(lessonId: string | null) {
  return useQuery({
    queryKey: ['lesson', lessonId ?? 'none'],
    queryFn: () => fetchLesson(lessonId!),
    enabled: Boolean(lessonId),
  });
}

export function useExercises(lessonId: string | null) {
  return useQuery({
    queryKey: ['exercises', lessonId ?? 'none'],
    queryFn: () => fetchExercises(lessonId!),
    enabled: Boolean(lessonId),
  });
}

export function useExercisesByIds(ids: string[], enabled = true) {
  return useQuery({
    queryKey: ['exercisesByIds', ids],
    queryFn: () => fetchExercisesByIds(ids),
    enabled: enabled && ids.length > 0,
    staleTime: 60_000,
  });
}
