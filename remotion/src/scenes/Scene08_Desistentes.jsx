import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { AthleteAvatar } from '../components/AthleteAvatar';

const formatDate = (d) => {
  if (!d) return '?';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  } catch { return d; }
};

export const Scene08_Desistentes = ({ data }) => {
  const frame = useCurrentFrame();
  const { withdrawals } = data;

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  if (!withdrawals || withdrawals.length === 0) {
    const noneOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <AbsoluteFill style={{
        background: '#0d0d0d',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px',
      }}>
        <div style={{ opacity: noneOpacity, textAlign: 'center' }}>
          <div style={{ fontSize: 64 }}>💎</div>
          <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 48, color: '#10b981', letterSpacing: 3, marginTop: 16 }}>
            NENHUMA DESISTÊNCIA OFICIAL
          </div>
          <div style={{ fontFamily: 'Inter, system-ui', fontSize: 22, color: 'rgba(255,255,255,0.35)', marginTop: 12, fontStyle: 'italic' }}>
            O grupo resistiu até o fim. Respeito.
          </div>
          <div style={{ fontFamily: 'Inter, system-ui', fontSize: 18, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
            (Só os fantasmas silenciosos não contam.)
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, #0d0d0d 0%, #120a00 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px', gap: 0,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />

      <div style={{ opacity: titleOpacity, textAlign: 'center', marginBottom: 44 }}>
        <div style={{ fontSize: 56 }}>⚰️</div>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 60,
          color: '#8b5cf6',
          letterSpacing: 3,
          lineHeight: 1,
          marginTop: 8,
        }}>
          DESISTENTES
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 20,
          color: 'rgba(255,255,255,0.35)',
          marginTop: 8,
        }}>
          Desistências oficiais da temporada
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 860 }}>
        {withdrawals.map((w, i) => {
          const startF = 20 + i * 18;
          const opacity = interpolate(frame, [startF, startF + 12], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          const x = interpolate(frame, [startF, startF + 12], [-40, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          const athlete = data.rankings?.principal?.find((a) => a.id === w.athleteId) || { name: w.athleteName, photoUrl: null };

          return (
            <div key={w.athleteId} style={{
              opacity,
              transform: `translateX(${x}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              background: 'rgba(139,92,246,0.07)',
              borderRadius: 16,
              padding: '20px 28px',
              border: '1px solid rgba(139,92,246,0.2)',
            }}>
              <AthleteAvatar name={w.athleteName} photoUrl={athlete.photoUrl} size={90} style={{ opacity: 0.7 }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'Bebas Neue, Impact, sans-serif',
                  fontSize: 44,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1,
                }}>
                  {w.athleteName}
                </div>
                <div style={{
                  fontFamily: 'Inter, system-ui',
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.35)',
                  marginTop: 6,
                }}>
                  
                </div>
              </div>
              <div style={{
                fontFamily: 'Inter, system-ui',
                fontSize: 18,
                color: 'rgba(139,92,246,0.7)',
                fontStyle: 'italic',
              }}>
                Desistiu em {formatDate(w.date)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        marginTop: 36,
        fontFamily: 'Inter, system-ui',
        fontSize: 20,
        color: 'rgba(255,255,255,0.25)',
        fontStyle: 'italic',
        textAlign: 'center',
      }}>
        "Nossas referências do que não fazer... Melhorem!"
      </div>
    </AbsoluteFill>
  );
};
