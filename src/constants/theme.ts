/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// SA-flag-inspired palette (protea green / gold / sky blue / red) tuned for
// AA contrast in both schemes, plus semantic tokens used across the app.
export const Colors = {
  light: {
    text: '#15201A',
    textSecondary: '#5B685F',
    background: '#FBFBF7',
    backgroundElement: '#F0F5EE',
    backgroundSelected: '#DFF0E3',
    border: '#E2E7DF',
    card: '#FFFFFF',
    overlay: 'rgba(15, 25, 18, 0.55)',

    primary: '#0B8A3D',
    primaryDark: '#066A2E',
    onPrimary: '#FFFFFF',
    secondary: '#F2A900',
    secondaryDark: '#C98A00',
    onSecondary: '#211500',
    accentBlue: '#0F3D91',
    accentBlueDark: '#0A2C6B',
    accentRed: '#D5312A',
    accentRedDark: '#A32620',

    success: '#0B8A3D',
    danger: '#D5312A',
    heart: '#EF4444',
    xp: '#F2A900',
    streak: '#E8730A',
  },
  dark: {
    text: '#EEF3EC',
    textSecondary: '#A9B6A6',
    background: '#0E1511',
    backgroundElement: '#182019',
    backgroundSelected: '#1E2F22',
    border: '#26312B',
    card: '#182019',
    overlay: 'rgba(0, 0, 0, 0.65)',

    primary: '#3ADC7C',
    primaryDark: '#1FAE63',
    onPrimary: '#062511',
    secondary: '#FFC94D',
    secondaryDark: '#D9A62E',
    onSecondary: '#211500',
    accentBlue: '#5C87E0',
    accentBlueDark: '#3E63C7',
    accentRed: '#FF7A72',
    accentRedDark: '#D4544C',

    success: '#3ADC7C',
    danger: '#FF7A72',
    heart: '#FF6B6B',
    xp: '#FFC94D',
    streak: '#FFA24D',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

/** Duolingo-style "pressable 3D" bottom border depth. */
export const PressDepth = 4;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
