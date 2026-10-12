import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Exercise, Language, Lesson, Unit } from '@/types/content';

// Firestore layout (flat top-level collections, filtered by foreign key —
// keeps the seed script and security rules simple for this content size):
//   languages/{languageId}
//   units/{unitId}            { languageId, order, ... }
//   lessons/{lessonId}        { unitId, order, ... }
//   exercises/{exerciseId}    { lessonId, order, ... }

export async function fetchLanguages(): Promise<Language[]> {
  const snap = await getDocs(collection(db, 'languages'));
  return snap.docs.map((d) => d.data() as Language);
}

export async function fetchUnits(languageId: string): Promise<Unit[]> {
  const q = query(
    collection(db, 'units'),
    where('languageId', '==', languageId),
    orderBy('order', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Unit);
}

export async function fetchLessons(unitId: string): Promise<Lesson[]> {
  const q = query(collection(db, 'lessons'), where('unitId', '==', unitId), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Lesson);
}

export type LearnPath = { units: Unit[]; lessonsByUnit: Record<string, Lesson[]> };

export async function fetchLearnPath(languageId: string): Promise<LearnPath> {
  const units = await fetchUnits(languageId);
  const lessonsByUnit: Record<string, Lesson[]> = {};
  await Promise.all(
    units.map(async (unit) => {
      lessonsByUnit[unit.id] = await fetchLessons(unit.id);
    }),
  );
  return { units, lessonsByUnit };
}

export async function fetchLesson(lessonId: string): Promise<Lesson | null> {
  const snap = await getDoc(doc(db, 'lessons', lessonId));
  return snap.exists() ? (snap.data() as Lesson) : null;
}

export async function fetchExercises(lessonId: string): Promise<Exercise[]> {
  const q = query(
    collection(db, 'exercises'),
    where('lessonId', '==', lessonId),
    orderBy('order', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Exercise);
}

/** Fetches exercises by id, preserving the order of `ids` (used by the
 *  Strengthen review mode, which wants most-recently-wrong first). */
export async function fetchExercisesByIds(ids: string[]): Promise<Exercise[]> {
  if (ids.length === 0) return [];
  const byId = new Map<string, Exercise>();
  // Firestore `in` supports at most 10 ids per query — chunk defensively.
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    const q = query(collection(db, 'exercises'), where('id', 'in', chunk));
    const snap = await getDocs(q);
    for (const d of snap.docs) byId.set(d.id, d.data() as Exercise);
  }
  return ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
}
