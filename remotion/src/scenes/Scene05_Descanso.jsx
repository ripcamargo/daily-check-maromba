import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { AthleteAvatar } from '../components/AthleteAvatar';
import { FPS } from '../utils/sceneConfig';

export const Scene05_Descanso = ({ data }) => {
  const frame = useCurrentFrame();
  const top3 = (data.rankings?.folgas || []).filter((a) => a.stats?.rest > 0).slice(0, 3);

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d0d0d 0%, #0a0f1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
        gap: 0,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#3b82f6' }} />

      <div style={{ opacity: titleOpacity, textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 68 }}>🛋️</div>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 64,
          color: '#3b82f6',
          letterSpacing: 3,
          lineHeight: 1,
        }}>
          MESTRES DO DESCANSO
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 22,
          color: 'rgba(255,255,255,0.35)',
          marginTop: 8,
        }}>
          Quem transformou folga em arte
        </div>
      </div>

      {top3.length === 0 ? (
        <div style={{
          opacity: interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          textAlign: 'center',
          fontFamily: 'Inter, system-ui',
          fontSize: 28,
          color: 'rgba(255,255,255,0.4)',
          fontStyle: 'italic',
        }}>
          Ninguém usou folgas. Isso é preocupante.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 880 }}>
          {top3.map((athlete, i) => {
            const startF = 20 + i * 20;
            const opacity = interpolate(frame, [startF, startF + 12], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const y = interpolate(frame, [startF, startF + 12], [30, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });

            return (
              <div key={athlete.id} style={{
                opacity,
                transform: `translateY(${y}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                background: 'rgba(59,130,246,0.07)',
                borderRadius: 16,
                padding: '20px 28px',
                border: '1px solid rgba(59,130,246,0.2)',
              }}>
                <div style={{
                  fontFamily: 'Bebas Neue, Impact, sans-serif',
                  fontSize: 40,
                  color: '#3b82f6',
                  width: 48,
                  textAlign: 'center',
                  flexShrink: 0,
                }}>
                  {i + 1}°
                </div>
                <AthleteAvatar name={athlete.name} photoUrl={athlete.photoUrl} size={90} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'Bebas Neue, Impact, sans-serif',
                    fontSize: 44,
                    color: '#fff',
                    lineHeight: 1,
                  }}>
                    {athlete.name}
                  </div>
                  <div style={{
                    fontFamily: 'Inter, system-ui',
                    fontSize: 17,
                    color: 'rgba(255,255,255,0.35)',
                    marginTop: 4,
                    fontStyle: 'italic',
                  }}>
                    {i === 0
                      ? `${athlete.name} transformou folga em estilo de vida.`
                      : `${athlete.stats?.rest} folgas tiradas com maestria.`}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontFamily: 'Bebas Neue, Impact, sans-serif',
                    fontSize: 60,
                    color: '#3b82f6',
                    lineHeight: 1,
                  }}>
                    {athlete.stats?.rest}
                  </div>
                  <div style={{
                    fontFamily: 'Inter, system-ui',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.3)',
                  }}>
                    FOLGAS
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};
