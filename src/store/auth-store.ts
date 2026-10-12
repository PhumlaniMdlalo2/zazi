import { onAuthStateChanged, type User } from 'firebase/auth';
import { create } from 'zustand';

import { auth, isFirebaseConfigured } from '@/lib/firebase';

type AuthState = {
  user: User | null;
  /** True until the first onAuthStateChanged callback fires. */
  initializing: boolean;
};

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  initializing: isFirebaseConfigured,
}));

if (isFirebaseConfigured) {
  onAuthStateChanged(auth, (user) => {
    useAuthStore.setState({ user, initializing: false });
  });
}
