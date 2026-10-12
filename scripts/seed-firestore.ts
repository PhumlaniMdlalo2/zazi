/**
 * One-time / re-runnable content push: writes the local isiXhosa seed data
 * (src/data/seed/xhosa.ts) into Firestore so the app has something to read.
 * Requires a service account key — see README "Firebase setup".
 *
 *   npm run seed
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { exercises, language, lessons, units } from '../src/data/seed/xhosa';

const keyPath = path.resolve(__dirname, '../serviceAccountKey.json');

if (!existsSync(keyPath)) {
  console.error(
    '\nMissing serviceAccountKey.json at the project root.\n' +
      'Firebase Console -> Project settings -> Service accounts -> Generate new private key,\n' +
      'save the downloaded file as serviceAccountKey.json in the project root, then re-run `npm run seed`.\n',
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seed() {
  const batch = db.batch();

  batch.set(db.collection('languages').doc(language.id), language);
  for (const unit of units) batch.set(db.collection('units').doc(unit.id), unit);
  for (const lesson of lessons) batch.set(db.collection('lessons').doc(lesson.id), lesson);
  for (const exercise of exercises) batch.set(db.collection('exercises').doc(exercise.id), exercise);

  await batch.commit();

  console.log(
    `Seeded 1 language, ${units.length} units, ${lessons.length} lessons, ${exercises.length} exercises.`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
