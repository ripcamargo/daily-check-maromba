import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { AthleteAvatar } from '../components/AthleteAvatar';
import { FPS } from '../utils/sceneConfig';

export const Scene06_Bonus = ({ data }) => {
  const frame = useCurrentFrame();
  const hasBonusDates = (data.season?.bonusDates || []).length > 0;
  const top3 = (data.rankings?.extra || []).filter((a) => a.stats?.extra > 0).slice(0, 3);

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const contentOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  if (!hasBonusDates || top3.length === 0) {
    return (
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, #0d0d0d 0%, #151008 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 60px',
        }}
      >
        <div style={{ opacity: contentOpacity, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>⭐</div>
          <div style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 48,
            color: '#eab308',
            letterSpacing: 3,
          }}>
            NENHUM TREINO BÔNUS
          </div>
          <div style={{
            fontFamily: 'Inter, system-ui',
            fontSize: 22,
            color: 'rgba(255,255,255,0.35)',
            marginTop: 12,
            fontStyle: 'italic',
          }}>
            Essa temporada não teve datas bônus. Mas a dedicação foi real.
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d0d0d 0%, #151008 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
        gap: 0,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#eab308' }} />

      <div style={{ opacity: titleOpacity, textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 68 }}>⭐</div>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 64,
          color: '#eab308',
          letterSpacing: 3,
          lineHeight: 1,
        }}>
          CAÇADORES DE BÔNUS
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 22,
          color: 'rgba(255,255,255,0.35)',
          marginTop: 8,
        }}>
          Treinos extras nos dias bônus
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 880 }}>
        {top3.map((athlete, i) => {
          const startF = 20 + i * 20;
          const scale = spring({ frame: frame - startF, fps: FPS, config: { damping: 80, stiffness: 200 } });
          const opacity = interpolate(frame, [startF, startF + 12], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });

          return (
            <div key={athlete.id} style={{
              opacity,
              transform: `scale(${scale})`,
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              background: i === 0 ? 'rgba(234,179,8,0.1)' : 'rgba(234,179,8,0.05)',
              borderRadius: 16,
              padding: '20px 28px',
              border: `1px solid ${i === 0 ? 'rgba(234,179,8,0.3)' : 'rgba(234,179,8,0.1)'}`,
            }}>
              <div style={{
                fontFamily: 'Bebas Neue, Impact, sans-serif',
                fontSize: 40,
                color: '#eab308',
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
                    ? 'Enquanto outros descansavam, foi treinar.'
                    : `${athlete.stats?.extra} estrela${athlete.stats?.extra !== 1 ? 's' : ''} conquistada${athlete.stats?.extra !== 1 ? 's' : ''}.`}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 60, color: '#eab308', lineHeight: 1 }}>
                  {'⭐'.repeat(Math.min(athlete.stats?.extra || 0, 5))}
                </div>
                <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 36, color: '#eab308' }}>
                  {athlete.stats?.extra}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
