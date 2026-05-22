import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const SceneWrapper = ({
  children,
  bg = '#0d0d0d',
  fadeInDuration = 8,
  fadeOutStart = null,
  fadeOutDuration = 8,
  totalDuration = null,
}) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, fadeInDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  let fadeOut = 1;
  if (fadeOutStart !== null && totalDuration !== null) {
    fadeOut = interpolate(
      frame,
      [fadeOutStart, fadeOutStart + fadeOutDuration],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: bg,
        opacity: Math.min(fadeIn, fadeOut),
        overflow: 'hidden',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
