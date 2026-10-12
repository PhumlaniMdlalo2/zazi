import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PressDepth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

/**
 * Duolingo-style "3D" button: a darker shadow layer sits behind a lighter
 * face layer with a bottom margin; pressing collapses the margin and nudges
 * the face down, so the button visually sinks instead of just dimming.
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  fullWidth = true,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const palette: Record<ButtonVariant, { face: string; shadow: string; text: string; border?: string }> = {
    primary: { face: theme.primary, shadow: theme.primaryDark, text: theme.onPrimary },
    secondary: { face: theme.secondary, shadow: theme.secondaryDark, text: theme.onSecondary },
    outline: { face: theme.card, shadow: theme.border, text: theme.primary, border: theme.border },
    danger: { face: theme.danger, shadow: '#9E241F', text: '#FFFFFF' },
  };
  const c = palette[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={fullWidth ? styles.fullWidth : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {({ pressed }) => (
        <View style={[styles.shadow, { backgroundColor: isDisabled ? theme.border : c.shadow }]}>
          <View
            style={[
              styles.face,
              {
                backgroundColor: isDisabled ? theme.backgroundElement : c.face,
                borderWidth: c.border ? 2 : 0,
                borderColor: c.border,
                marginBottom: pressed && !isDisabled ? 0 : PressDepth,
                transform: [{ translateY: pressed && !isDisabled ? PressDepth : 0 }],
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={c.text} />
            ) : (
              <ThemedText style={[styles.label, { color: isDisabled ? theme.textSecondary : c.text }]}>
                {title}
              </ThemedText>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  shadow: { borderRadius: Radius.lg },
  face: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 16, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
});
