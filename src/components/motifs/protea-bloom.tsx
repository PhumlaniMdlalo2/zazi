import Svg, { Circle, Ellipse } from 'react-native-svg';

type ProteaBloomProps = {
  size?: number;
  color?: string;
  opacity?: number;
};

/**
 * A soft, abstracted bloom (inspired by the king protea, SA's national
 * flower) for hero backgrounds — not a botanical illustration, just a
 * decorative accent shape built from rotated ellipses.
 */
export function ProteaBloom({ size = 160, color = '#F2A900', opacity = 0.16 }: ProteaBloomProps) {
  const petals = 8;
  const cx = 50;
  const cy = 50;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={opacity}>
      {Array.from({ length: petals }).map((_, i) => (
        <Ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={22}
          ry={42}
          fill={color}
          transform={`rotate(${(360 / petals) * i} ${cx} ${cy})`}
        />
      ))}
      <Circle cx={cx} cy={cy} r={14} fill={color} />
    </Svg>
  );
}
