import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';
import { ensureUserProfile } from '@/lib/progress-repository';

export async function continueAsGuest() {
  const { user } = await signInAnonymously(auth);
  await ensureUserProfile(user.uid, 'Guest', true);
  return user;
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await ensureUserProfile(user.uid, displayName, false);
  return user;
}

export async function signInWithEmail(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(user.uid, user.displayName ?? 'Learner', false);
  return user;
}

export async function signOutUser() {
  await signOut(auth);
}
