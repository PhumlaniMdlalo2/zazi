import { create } from 'zustand';

import type { Exercise } from '@/types/content';

const START_HEARTS = 5;

type SessionStatus = 'active' | 'failed' | 'completed';

type SessionState = {
  lessonId: string | null;
  exercises: Exercise[];
  currentIndex: number;
  hearts: number;
  xpEarned: number;
  correctCount: number;
  status: SessionStatus;
  /** null = not yet answered this card */
  lastAnswerCorrect: boolean | null;
  start: (lessonId: string, exercises: Exercise[]) => void;
  answer: (correct: boolean, xpOnCorrect: number) => void;
  advance: () => void;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  lessonId: null,
  exercises: [],
  currentIndex: 0,
  hearts: START_HEARTS,
  xpEarned: 0,
  correctCount: 0,
  status: 'active',
  lastAnswerCorrect: null,

  start: (lessonId, exercises) =>
    set({
      lessonId,
      exercises,
      currentIndex: 0,
      hearts: START_HEARTS,
      xpEarned: 0,
      correctCount: 0,
      status: 'active',
      lastAnswerCorrect: null,
    }),

  answer: (correct, xpOnCorrect) => {
    const { hearts, xpEarned, correctCount } = get();
    const nextHearts = correct ? hearts : hearts - 1;
    set({
      lastAnswerCorrect: correct,
      hearts: nextHearts,
      xpEarned: correct ? xpEarned + xpOnCorrect : xpEarned,
      correctCount: correct ? correctCount + 1 : correctCount,
      status: nextHearts <= 0 ? 'failed' : 'active',
    });
  },

  advance: () => {
    const { currentIndex, exercises, status } = get();
    if (status !== 'active') return;
    const next = currentIndex + 1;
    if (next >= exercises.length) set({ status: 'completed' });
    else set({ currentIndex: next, lastAnswerCorrect: null });
  },
}));
