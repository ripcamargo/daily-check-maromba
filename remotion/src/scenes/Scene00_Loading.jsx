import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const Scene00_Loading = () => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, 70], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const glitch = Math.sin(frame * 0.8) > 0.92 ? (Math.random() > 0.5 ? 2 : -2) : 0;

  return (
    <AbsoluteFill
      style={{
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
      }}
    >
      <div
        style={{
          opacity: textOpacity,
          transform: `translateX(${glitch}px)`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 52,
            color: '#fff',
            letterSpacing: 8,
          }}
        >
          GYM WRAPPED
        </div>
        <div
          style={{
            fontFamily: 'Inter, system-ui',
            fontSize: 22,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 4,
            marginTop: 8,
          }}
        >
          CARREGANDO DADOS DA TEMPORADA...
        </div>
      </div>

      <div
        style={{
          width: 480,
          height: 4,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #f5a623, #ff6b35)',
            borderRadius: 2,
          }}
        />
      </div>

      <div
        style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 36,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: 3,
        }}
      >
        {Math.round(progress)}%
      </div>
    </AbsoluteFill>
  );
};
