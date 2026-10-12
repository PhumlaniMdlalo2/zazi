import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { GeoDivider } from '@/components/motifs/geo-divider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuthUser, useUserProfile } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { signOutUser } from '@/lib/auth-actions';

export function Profile() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthUser();
  const { data: profile } = useUserProfile();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOutUser();
      router.replace('/(auth)/welcome');
    } finally {
      setSigningOut(false);
    }
  }

  const displayName = profile?.displayName || user?.displayName || 'Guest';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="person" size={40} color={theme.primary} />
          </View>
          <ThemedText type="title" style={styles.name}>
            {displayName}
          </ThemedText>
          {profile?.isAnonymous && (
            <ThemedText type="small" themeColor="textSecondary">
              Guest account — sign up to keep your progress
            </ThemedText>
          )}
        </View>

        <GeoDivider />

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="flame" size={28} color={theme.streak} />
            <ThemedText type="title" style={styles.statValue}>
              {profile?.streak ?? 0}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Day streak
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="star" size={28} color={theme.xp} />
            <ThemedText type="title" style={styles.statValue}>
              {profile?.xp ?? 0}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Total XP
            </ThemedText>
          </View>
        </View>

        <View style={styles.footer}>
          <Button title="Sign Out" variant="outline" onPress={handleSignOut} loading={signingOut} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.four },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 28 },
  statsRow: { flexDirection: 'row', gap: Spacing.three },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.four,
    borderRadius: Radius.lg,
  },
  statValue: { fontSize: 28 },
  footer: { marginTop: 'auto', paddingBottom: Spacing.four },
});
