import { useCurrentFrame, interpolate } from 'remotion';

export const AnimatedCounter = ({
  from = 0,
  to,
  startFrame = 0,
  endFrame = 60,
  style = {},
  suffix = '',
  prefix = '',
}) => {
  const frame = useCurrentFrame();
  const value = Math.round(
    interpolate(frame, [startFrame, endFrame], [from, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  return (
    <span style={style}>
      {prefix}
      {value.toLocaleString('pt-BR')}
      {suffix}
    </span>
  );
};
