import type { ThemeColor } from '@/constants/theme';
import type { UnitTheme } from '@/types/content';

/** Only isiXhosa ships in v1; the content model supports adding more
 *  languages later without changing this constant's call sites. */
export const DEFAULT_LANGUAGE_ID = 'xhosa';

export const UNIT_THEME_TOKENS: Record<UnitTheme, { face: ThemeColor; shadow: ThemeColor }> = {
  green: { face: 'primary', shadow: 'primaryDark' },
  gold: { face: 'secondary', shadow: 'secondaryDark' },
  blue: { face: 'accentBlue', shadow: 'accentBlueDark' },
  red: { face: 'accentRed', shadow: 'accentRedDark' },
};
