import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { AthleteAvatar } from '../components/AthleteAvatar';
import { FPS } from '../utils/sceneConfig';

const MEDAL_COLORS = ['#f5a623', '#9ca3af', '#cd7c32'];

export const Scene09_Rankings = ({ data }) => {
  const frame = useCurrentFrame();
  const ranked = data.rankings?.principal || [];

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const subtextOpacity = interpolate(frame, [180, 210], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const maxPresent = ranked[0]?.stats?.present || 1;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d0d0d 0%, #1a1a2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '40px 40px 20px',
        gap: 0,
        overflowY: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #f5a623, #8b5cf6)' }} />

      <div style={{ opacity: titleOpacity, textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 36,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 6,
        }}>
          CLASSIFICAÇÃO FINAL
        </div>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 68,
          color: '#fff',
          lineHeight: 1,
          letterSpacing: 2,
        }}>
          RANKING GERAL
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 960 }}>
        {ranked.map((athlete, i) => {
          const startF = 20 + i * 18;
          const opacity = interpolate(frame, [startF, startF + 15], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          const x = interpolate(frame, [startF, startF + 15], [80, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });

          const barProgress = interpolate(frame, [startF + 5, startF + 35], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });

          const isTop3 = i < 3;
          const barPct = ((athlete.stats?.present || 0) / maxPresent) * 100;
          const accentColor = isTop3 ? MEDAL_COLORS[i] : 'rgba(255,255,255,0.2)';

          return (
            <div key={athlete.id} style={{
              opacity,
              transform: `translateX(${x}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: isTop3
                ? `rgba(${i === 0 ? '245,166,35' : i === 1 ? '156,163,175' : '205,124,50'},0.08)`
                : 'rgba(255,255,255,0.03)',
              borderRadius: 14,
              padding: `${isTop3 ? '14px' : '10px'} 20px`,
              border: `1px solid ${isTop3 ? accentColor + '33' : 'rgba(255,255,255,0.05)'}`,
            }}>
              {/* Position */}
              <div style={{
                fontFamily: 'Bebas Neue, Impact, sans-serif',
                fontSize: isTop3 ? 36 : 28,
                color: isTop3 ? accentColor : 'rgba(255,255,255,0.3)',
                width: 44,
                textAlign: 'center',
                flexShrink: 0,
              }}>
                {i + 1}°
              </div>

              {/* Avatar */}
              <AthleteAvatar
                name={athlete.name}
                photoUrl={athlete.photoUrl}
                size={isTop3 ? 64 : 50}
                style={{ border: `2px solid ${accentColor}` }}
              />

              {/* Name + bar */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontFamily: 'Bebas Neue, Impact, sans-serif',
                  fontSize: isTop3 ? 34 : 28,
                  color: athlete.withdrawn ? 'rgba(255,255,255,0.3)' : '#fff',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {athlete.name}
                  {athlete.withdrawn && <span style={{ fontSize: 16, color: '#8b5cf6', marginLeft: 8 }}>desistiu</span>}
                </div>
                <div style={{ marginTop: 4, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{
                    height: '100%',
                    width: `${barPct * barProgress}%`,
                    background: accentColor,
                    borderRadius: 2,
                  }} />
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: isTop3 ? 34 : 28, color: '#10b981', lineHeight: 1 }}>
                    {athlete.stats?.present}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>PRES</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: isTop3 ? 34 : 28, color: '#ef4444', lineHeight: 1 }}>
                    {athlete.stats?.absence}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>FALT</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: isTop3 ? 28 : 22, color: '#f5a623', lineHeight: 1 }}>
                    {athlete.xp}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>XP</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        opacity: subtextOpacity,
        marginTop: 20,
        fontFamily: 'Bebas Neue, Impact, sans-serif',
        fontSize: 28,
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: 4,
        textAlign: 'center',
      }}>
        {/*{ranked[ranked.length - 1]?.name?.toUpperCase()} SABE O QUE PRECISA FAZER. */}
      </div>
    </AbsoluteFill>
  );
};
