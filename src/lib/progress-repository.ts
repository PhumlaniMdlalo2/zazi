import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { todayLocalISO, isYesterday } from '@/lib/date';
import { db } from '@/lib/firebase';
import type { LessonProgress, UserProfile, WrongExerciseRecord } from '@/types/progress';

const profileRef = (uid: string) => doc(db, 'userProfiles', uid);
const lessonProgressRef = (uid: string, lessonId: string) =>
  doc(db, 'userProfiles', uid, 'lessonProgress', lessonId);
const wrongExerciseRef = (uid: string, exerciseId: string) =>
  doc(db, 'userProfiles', uid, 'wrongExercises', exerciseId);

export async function ensureUserProfile(
  uid: string,
  displayName: string,
  isAnonymous: boolean,
): Promise<UserProfile> {
  const ref = profileRef(uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return existing.data() as UserProfile;

  const profile: UserProfile = {
    uid,
    displayName,
    isAnonymous,
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    createdAtISO: new Date().toISOString(),
  };
  await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
  return profile;
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(profileRef(uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Keyed by lessonId — used to compute which lesson nodes are locked. */
export async function fetchAllLessonProgress(uid: string): Promise<Record<string, LessonProgress>> {
  const snap = await getDocs(collection(db, 'userProfiles', uid, 'lessonProgress'));
  const result: Record<string, LessonProgress> = {};
  for (const d of snap.docs) result[d.id] = d.data() as LessonProgress;
  return result;
}

/**
 * Records a finished lesson: bumps XP, updates the daily streak (already
 * active today -> unchanged, active yesterday -> +1, otherwise resets to 1),
 * and upserts per-lesson progress. Returns the profile's new totals.
 */
export async function recordLessonCompletion(
  uid: string,
  lessonId: string,
  xpEarned: number,
  accuracy: number,
): Promise<Pick<UserProfile, 'xp' | 'streak'>> {
  const ref = profileRef(uid);
  const today = todayLocalISO();

  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const profile = snap.data() as UserProfile | undefined;
    const lastActiveDate = profile?.lastActiveDate ?? null;

    let nextStreak = 1;
    if (lastActiveDate === today) nextStreak = profile?.streak ?? 1;
    else if (lastActiveDate && isYesterday(lastActiveDate, today)) nextStreak = (profile?.streak ?? 0) + 1;

    const nextXp = (profile?.xp ?? 0) + xpEarned;

    tx.set(
      ref,
      { xp: nextXp, streak: nextStreak, lastActiveDate: today },
      { merge: true },
    );

    return { xp: nextXp, streak: nextStreak };
  });

  const progressRef = lessonProgressRef(uid, lessonId);
  const previous = await getDoc(progressRef);
  const bestAccuracy = Math.max(accuracy, (previous.data()?.bestAccuracy as number | undefined) ?? 0);

  await setDoc(
    progressRef,
    { lessonId, completed: true, bestAccuracy, lastAttemptISO: new Date().toISOString() },
    { merge: true },
  );

  return result;
}

/** Tags an exercise as missed — bumped each time, newest wrongs surfaced
 *  first so the Strengthen review queue naturally prioritizes them. */
export async function recordWrongExercise(uid: string, exerciseId: string): Promise<void> {
  await setDoc(
    wrongExerciseRef(uid, exerciseId),
    {
      exerciseId,
      wrongCount: increment(1),
      lastWrongISO: new Date().toISOString(),
    },
    { merge: true },
  );
}

/** Clears the wrong marker once the learner answers correctly again. */
export async function clearWrongExercise(uid: string, exerciseId: string): Promise<void> {
  await deleteDoc(wrongExerciseRef(uid, exerciseId));
}

/** Most-recently-wrong first — that is exactly the review queue order. */
export async function fetchWrongExercises(uid: string): Promise<WrongExerciseRecord[]> {
  const snap = await getDocs(query(collection(db, 'userProfiles', uid, 'wrongExercises')));
  const records = snap.docs.map((d) => d.data() as WrongExerciseRecord);
  return records.sort((a, b) => b.lastWrongISO.localeCompare(a.lastWrongISO));
}
