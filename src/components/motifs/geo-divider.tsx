import Svg, { Polygon } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

const COLUMNS = 14;

/**
 * A zig-zag triangle strip in the flag palette — a geometric nod to
 * southern African beadwork/mural patterns, not a literal reproduction of
 * any specific cultural artwork. Used as a decorative section divider.
 */
export function GeoDivider({ height = 12 }: { height?: number }) {
  const theme = useTheme();
  const palette = [theme.primary, theme.secondary, theme.accentBlue, theme.accentRed];
  const triWidth = 100 / COLUMNS;

  return (
    <Svg width="100%" height={height} viewBox="0 0 100 10" preserveAspectRatio="none">
      {Array.from({ length: COLUMNS }).map((_, i) => {
        const x = i * triWidth;
        const color = palette[i % palette.length];
        const pointsUp = `${x},10 ${x + triWidth / 2},0 ${x + triWidth},10`;
        const pointsDown = `${x},0 ${x + triWidth / 2},10 ${x + triWidth},0`;
        return <Polygon key={i} points={i % 2 === 0 ? pointsUp : pointsDown} fill={color} />;
      })}
    </Svg>
  );
}
