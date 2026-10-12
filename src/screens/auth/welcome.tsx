import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { GeoDivider } from '@/components/motifs/geo-divider';
import { ProteaBloom } from '@/components/motifs/protea-bloom';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { continueAsGuest } from '@/lib/auth-actions';
import { isFirebaseConfigured } from '@/lib/firebase';

export function Welcome() {
  const router = useRouter();
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  async function handleGuest() {
    setGuestError(null);
    setGuestLoading(true);
    try {
      await continueAsGuest();
      router.replace('/(tabs)/learn');
    } catch (err) {
      setGuestError(err instanceof Error ? err.message : 'Could not start a guest session.');
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <View style={styles.bloom}>
            <ProteaBloom size={220} />
          </View>
          <ThemedText style={styles.flag}>🇿🇦</ThemedText>
          <ThemedText type="title" style={styles.title}>
            Zazi
          </ThemedText>
          <ThemedText type="subtitle" themeColor="textSecondary" style={styles.tagline}>
            Learn isiXhosa, the South African way.
          </ThemedText>
        </View>

        <GeoDivider />

        {!isFirebaseConfigured ? (
          <ThemedView type="backgroundElement" style={styles.setupCard}>
            <ThemedText type="smallBold">Firebase isn&rsquo;t configured yet</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.setupBody}>
              Add your Firebase project keys to a .env file (see .env.example / README) to enable
              accounts, progress sync, and lesson content.
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.actions}>
            {guestError && (
              <ThemedText type="small" themeColor="danger" style={styles.error}>
                {guestError}
              </ThemedText>
            )}
            <Button title="Get Started" onPress={() => router.push('/(auth)/sign-up')} />
            <Button
              title="I already have an account"
              variant="outline"
              onPress={() => router.push('/(auth)/sign-in')}
            />
            <Button
              title="Continue as Guest"
              variant="secondary"
              onPress={handleGuest}
              loading={guestLoading}
            />
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  bloom: { position: 'absolute', top: '18%' },
  flag: { fontSize: 40 },
  title: { fontSize: 56 },
  tagline: { textAlign: 'center' },
  actions: { width: '100%', gap: Spacing.three, paddingBottom: Spacing.four },
  error: { textAlign: 'center' },
  setupCard: { width: '100%', borderRadius: 16, padding: Spacing.four, marginBottom: Spacing.four, gap: Spacing.two },
  setupBody: { lineHeight: 20 },
});
