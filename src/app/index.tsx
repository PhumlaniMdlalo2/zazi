import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { useAuthUser } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function Index() {
  const { user, initializing } = useAuthUser();
  const theme = useTheme();

  if (!isFirebaseConfigured) return <Redirect href="/(auth)/welcome" />;

  if (initializing) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={theme.primary} size="large" />
      </ThemedView>
    );
  }

  return <Redirect href={user ? '/(tabs)/learn' : '/(auth)/welcome'} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
