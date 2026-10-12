import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Grace period before we assume a clip failed to load (e.g. not recorded). */
const LOAD_GRACE_MS = 5000;

type Props = {
  audioUrl: string;
};

/**
 * Round speaker button that plays a short narration clip on tap. Rendered by
 * exercise cards only when the exercise has audio; a clip that never loads
 * (file not recorded yet) settles into a muted, disabled look after a short
 * grace period rather than spinning forever or crashing. Re-tap while playing
 * stops; after finishing, re-tap restarts from 0.
 */
export function SpeakerButton({ audioUrl }: Props) {
  const theme = useTheme();
  const player = useAudioPlayer(audioUrl, { keepAudioSessionActive: true });
  const status = useAudioPlayerStatus(player);
  const [failed, setFailed] = useState(false);

  const loaded = status.isLoaded;
  const ready = loaded && !failed;

  useEffect(() => {
    if (loaded) {
      setFailed(false);
      return;
    }
    const timer = setTimeout(() => setFailed(true), LOAD_GRACE_MS);
    return () => clearTimeout(timer);
  }, [loaded]);

  function handlePress() {
    if (!ready) return;
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish) {
      player.seekTo(0);
    }
    player.play();
  }

  return (
    <Pressable
      accessibilityLabel="Play audio"
      accessibilityRole="button"
      onPress={handlePress}
      disabled={!ready}
      style={[styles.button, { backgroundColor: theme.backgroundElement }]}
    >
      {status.playing ? (
        <Ionicons name="volume-high" size={26} color={theme.primary} />
      ) : failed || !ready ? (
        <Ionicons name="volume-mute" size={26} color={theme.textSecondary} />
      ) : (
        <Ionicons name="volume-high" size={26} color={theme.text} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
});