export type UserProfile = {
  uid: string;
  displayName: string;
  isAnonymous: boolean;
  xp: number;
  streak: number;
  /** yyyy-mm-dd (device-local) of the last day a lesson was completed. */
  lastActiveDate: string | null;
  createdAtISO: string;
};

export type LessonProgress = {
  lessonId: string;
  completed: boolean;
  bestAccuracy: number;
  lastAttemptISO: string;
};

/** An exercise the learner got wrong, used to build "Strengthen" review
 *  sessions. Stored at userProfiles/{uid}/wrongExercises/{exerciseId}. */
export type WrongExerciseRecord = {
  exerciseId: string;
  wrongCount: number;
  lastWrongISO: string;
};
