import { setAudioModeAsync } from 'expo-audio';

/**
 * Audio storage + playback conventions for Zazi.
 *
 * Clips live in Firebase Storage under `audio/{languageId}/{exerciseId}.m4a`
 * (see FLUENCY-ROADMAP §4.1). An exercise carries an optional `audioUrl`
 * string; when present, exercise cards render a SpeakerButton that plays it.
 * When absent, no button shows — so content without clips degrades silently.
 */

/** Storage object path for an exercise clip, e.g. audio/xhosa/xhosa-u1-l3-e2.m4a. */
export function audioPathForExercise(languageId: string, exerciseId: string): string {
  return `audio/${languageId}/${exerciseId}.m4a`;
}

/**
 * Public download URL for a Storage object path, matching the standard
 * Firebase REST media URL. Returns null if the project bucket isn't set.
 */
export function storageDownloadUrl(bucket: string, path: string): string | null {
  if (!bucket) return null;
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(path)}?alt=media`;
}

/**
 * Resolves an exercise's audio URL at runtime: an explicit stored `audioUrl`
 * wins; otherwise fall back to the conventional clip path on the configured
 * bucket (so content authored without a clip still gains audio once files land
 * at the standard locations). The language id is the exercise id's prefix,
 * e.g. `xhosa` from `xhosa-u1-l1-e2`.
 */
export function exerciseAudioUrl(exerciseId: string, stored?: string): string | null {
  if (stored) return stored;
  const bucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucket) return null;
  const languageId = exerciseId.split('-')[0];
  return storageDownloadUrl(bucket, audioPathForExercise(languageId, exerciseId));
}

/**
 * Configure the shared audio session for short narration clips: play in silent
 * mode (iOS) and duck under other apps rather than stealing focus. Safe to call
 * once at app boot.
 */
export async function configureAudioMode(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'duckOthers',
  });
}