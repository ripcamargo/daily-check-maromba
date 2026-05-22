import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { AthleteAvatar } from '../components/AthleteAvatar';
import { FPS } from '../utils/sceneConfig';

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#f5a623', '#9ca3af', '#cd7c32'];
const MEDAL_SIZES = [130, 110, 100];

export const Scene03_TopPresentes = ({ data }) => {
  const frame = useCurrentFrame();
  const top3 = (data.rankings?.principal || []).slice(0, 3);

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const subtextOpacity = interpolate(frame, [130, 160], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d0d0d 0%, #1c1208 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
        gap: 0,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #f5a623, #ff6b35)' }} />

      <div style={{ opacity: titleOpacity, textAlign: 'center', marginBottom: 56 }}>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 36,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 6,
        }}>
          PÓDIO DA TEMPORADA
        </div>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 72,
          color: '#fff',
          lineHeight: 1,
          letterSpacing: 2,
        }}>
          MAIS PRESENTES
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 900 }}>
        {top3.map((athlete, i) => {
          const startF = 25 + i * 25;
          const scale = spring({ frame: frame - startF, fps: FPS, config: { damping: 70, stiffness: 200 } });
          const opacity = interpolate(frame, [startF, startF + 12], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });

          const maxPresent = top3[0]?.stats?.present || 1;
          const barPct = (athlete.stats?.present / maxPresent) * 100;

          return (
            <div
              key={athlete.id}
              style={{
                opacity,
                transform: `scale(${scale})`,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                background: i === 0
                  ? 'linear-gradient(90deg, rgba(245,166,35,0.15), rgba(245,166,35,0.03))'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i === 0 ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 20,
                padding: '20px 28px',
              }}
            >
              {/* Position */}
              <div style={{
                fontFamily: 'Bebas Neue, Impact, sans-serif',
                fontSize: 56,
                width: 60,
                textAlign: 'center',
                flexShrink: 0,
              }}>
                {MEDALS[i]}
              </div>

              {/* Avatar */}
              <AthleteAvatar
                name={athlete.name}
                photoUrl={athlete.photoUrl}
                size={MEDAL_SIZES[i]}
                style={{ border: `3px solid ${MEDAL_COLORS[i]}` }}
              />

              {/* Info */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontFamily: 'Bebas Neue, Impact, sans-serif',
                  fontSize: i === 0 ? 52 : 44,
                  color: i === 0 ? '#f5a623' : '#fff',
                  letterSpacing: 1,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {athlete.name}
                </div>
                <div style={{
                  fontFamily: 'Inter, system-ui',
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.4)',
                  marginTop: 6,
                }}>
                  {athlete.rank?.name} · {athlete.xp} XP
                </div>
                {/* Bar */}
                <div style={{ marginTop: 10, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${barPct * scale}%`,
                    background: MEDAL_COLORS[i],
                    borderRadius: 3,
                  }} />
                </div>
              </div>

              {/* Present count */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontFamily: 'Bebas Neue, Impact, sans-serif',
                  fontSize: 64,
                  color: MEDAL_COLORS[i],
                  lineHeight: 1,
                }}>
                  {athlete.stats?.present}
                </div>
                <div style={{
                  fontFamily: 'Inter, system-ui',
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: 1,
                }}>
                  PRESENÇAS
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtext for 3rd place */}
      {top3[0] && top3[1] && (
        <div style={{
          opacity: subtextOpacity,
          marginTop: 44,
          fontFamily: 'Inter, system-ui',
          fontSize: 22,
          color: 'rgba(255,255,255,0.4)',
          fontStyle: 'italic',
          textAlign: 'center',
        }}>
          {top3[0].name} liderou com {top3[0].stats?.present} presenças.{' '}
          {top3[1].name} ficou a {top3[0].stats?.present - top3[1].stats?.present} de distância.
        </div>
      )}
    </AbsoluteFill>
  );
};
