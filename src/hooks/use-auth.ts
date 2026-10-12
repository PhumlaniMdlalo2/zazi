import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchUserProfile } from '@/lib/progress-repository';
import { useAuthStore } from '@/store/auth-store';

export function useAuthUser() {
  // Select primitives individually rather than returning a new `{ user,
  // initializing }` object from the store selector itself — zustand's
  // useSyncExternalStore snapshot is compared by reference, so a fresh
  // object literal every call never equals the previous one and triggers
  // an infinite render loop. Combining the two afterwards, in our own hook
  // body, is fine — that object is just a normal return value, not a snapshot.
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  return { user, initializing };
}

export function useUserProfile() {
  const { user } = useAuthUser();
  return useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: () => fetchUserProfile(user!.uid),
    enabled: Boolean(user),
  });
}

export function useInvalidateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuthUser();
  return () => queryClient.invalidateQueries({ queryKey: ['userProfile', user?.uid] });
}
