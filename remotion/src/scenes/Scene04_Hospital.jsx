import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { AthleteAvatar } from '../components/AthleteAvatar';
import { FPS } from '../utils/sceneConfig';

function getHospitalPhrase(visits) {
  if (visits === 0) return 'Imune. Ou não foi o suficiente pra machucar.';
  if (visits === 1) return 'Pagou o preço uma vez. Aprendeu? Talvez.';
  if (visits <= 3) return 'Dedicação perigosa. Respeito com ressalvas.';
  return 'O convênio médico agradece pessoalmente.';
}

export const Scene04_Hospital = ({ data }) => {
  const frame = useCurrentFrame();
  const { groupStats } = data;
  const top3 = (data.rankings?.hospital || []).filter((a) => a.stats?.hospital > 0).slice(0, 3);

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const noHospital = groupStats.totalHospital === 0;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d0d0d 0%, #1a0f00 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
        gap: 0,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#f59e0b' }} />

      <div style={{ opacity: titleOpacity, textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 72 }}>🚑</div>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 64,
          color: '#f59e0b',
          letterSpacing: 3,
          lineHeight: 1,
        }}>
          RANKING DO HOSPITAL
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 22,
          color: 'rgba(255,255,255,0.35)',
          marginTop: 8,
        }}>
          Quem se dedicou além do limite físico
        </div>
      </div>

      {noHospital ? (
        <div style={{
          opacity: interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          textAlign: 'center',
          padding: '40px 60px',
          background: 'rgba(16,185,129,0.08)',
          borderRadius: 20,
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>💪</div>
          <div style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 48,
            color: '#10b981',
            letterSpacing: 2,
          }}>
            ZERO HOSPITALIZAÇÕES
          </div>
          <div style={{
            fontFamily: 'Inter, system-ui',
            fontSize: 22,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 12,
          }}>
            O grupo sobreviveu intacto.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 880 }}>
          {top3.map((athlete, i) => {
            const startF = 25 + i * 22;
            const opacity = interpolate(frame, [startF, startF + 12], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const x = interpolate(frame, [startF, startF + 12], [50, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });

            return (
              <div key={athlete.id} style={{
                opacity,
                transform: `translateX(${x}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                background: 'rgba(245,158,11,0.07)',
                borderRadius: 16,
                padding: '20px 28px',
                border: '1px solid rgba(245,158,11,0.2)',
              }}>
                <div style={{
                  fontFamily: 'Bebas Neue, Impact, sans-serif',
                  fontSize: 40,
                  color: '#f59e0b',
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
                    letterSpacing: 1,
                    lineHeight: 1,
                  }}>
                    {athlete.name}
                  </div>
                  <div style={{
                    fontFamily: 'Inter, system-ui',
                    fontSize: 18,
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: 4,
                    fontStyle: 'italic',
                  }}>
                    {getHospitalPhrase(athlete.stats?.hospital)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontFamily: 'Bebas Neue, Impact, sans-serif',
                    fontSize: 60,
                    color: '#f59e0b',
                    lineHeight: 1,
                  }}>
                    {athlete.stats?.hospital}
                  </div>
                  <div style={{
                    fontFamily: 'Inter, system-ui',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.3)',
                  }}>
                    VISITAS
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
