import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { AthleteAvatar } from '../components/AthleteAvatar';
import { FPS } from '../utils/sceneConfig';

function getRivalFrase(diff) {
  if (diff === 0) return 'Empatados. Isso precisa ser resolvido na próxima temporada.';
  if (diff === 1) return `A diferença foi 1 treino. Um. Único. Treino.`;
  if (diff <= 5) return `Próximo o suficiente pra doer.`;
  return `Diferença de ${diff} treinos. Mas a rivalidade é real.`;
}

export const Scene11_Rivalidade = ({ data }) => {
  const frame = useCurrentFrame();
  const { rivalry } = data;

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  if (!rivalry) {
    return (
      <AbsoluteFill style={{
        background: '#0d0d0d',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px',
      }}>
        <div style={{
          opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 48, color: '#8b5cf6', letterSpacing: 3 }}>
            RIVALIDADE NÃO ENCONTRADA
          </div>
          <div style={{ fontFamily: 'Inter, system-ui', fontSize: 22, color: 'rgba(255,255,255,0.35)', marginTop: 12, fontStyle: 'italic' }}>
            Com apenas um atleta, não há rival. Só há solidão.
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  const { athleteA, athleteB, difference } = rivalry;

  const vsOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const vsScale = spring({ frame: frame - 40, fps: FPS, config: { damping: 50, stiffness: 300 } });

  const athleteAScale = spring({ frame: frame - 20, fps: FPS, config: { damping: 70, stiffness: 180 } });
  const athleteAOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const athleteBScale = spring({ frame: frame - 30, fps: FPS, config: { damping: 70, stiffness: 180 } });
  const athleteBOpacity = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const phraseOpacity = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, #0d0d0d 0%, #1a0d1a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', gap: 0,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #ef4444, #8b5cf6)' }} />

      <div style={{ opacity: titleOpacity, textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 36, color: 'rgba(255,255,255,0.35)', letterSpacing: 6 }}>
          A RIVALIDADE DA TEMPORADA
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 32, width: '100%', maxWidth: 960 }}>
        {/* Athlete A */}
        <div style={{
          opacity: athleteAOpacity,
          transform: `scale(${athleteAScale})`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(245,166,35,0.07)',
          borderRadius: 24,
          padding: '32px 24px',
          border: '1px solid rgba(245,166,35,0.2)',
        }}>
          <AthleteAvatar name={athleteA.name} photoUrl={athleteA.photoUrl} size={140} style={{ border: '3px solid #f5a623' }} />
          <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 44, color: '#fff', letterSpacing: 1, textAlign: 'center', lineHeight: 1 }}>
            {athleteA.name}
          </div>
          <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 80, color: '#f5a623', lineHeight: 1 }}>
            {athleteA.stats?.present}
          </div>
          <div style={{ fontFamily: 'Inter, system-ui', fontSize: 16, color: 'rgba(255,255,255,0.35)', letterSpacing: 2 }}>
            PRESENÇAS
          </div>
        </div>

        {/* VS */}
        <div style={{
          opacity: vsOpacity,
          transform: `scale(${vsScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 80,
            color: '#8b5cf6',
            lineHeight: 1,
            textShadow: '0 0 30px #8b5cf6aa',
          }}>
            VS
          </div>
          <div style={{
            fontFamily: 'Inter, system-ui',
            fontSize: 16,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: 2,
          }}>
            DIFERENÇA: {difference}
          </div>
        </div>

        {/* Athlete B */}
        <div style={{
          opacity: athleteBOpacity,
          transform: `scale(${athleteBScale})`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(139,92,246,0.07)',
          borderRadius: 24,
          padding: '32px 24px',
          border: '1px solid rgba(139,92,246,0.2)',
        }}>
          <AthleteAvatar name={athleteB.name} photoUrl={athleteB.photoUrl} size={140} style={{ border: '3px solid #8b5cf6' }} />
          <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 44, color: '#fff', letterSpacing: 1, textAlign: 'center', lineHeight: 1 }}>
            {athleteB.name}
          </div>
          <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 80, color: '#8b5cf6', lineHeight: 1 }}>
            {athleteB.stats?.present}
          </div>
          <div style={{ fontFamily: 'Inter, system-ui', fontSize: 16, color: 'rgba(255,255,255,0.35)', letterSpacing: 2 }}>
            PRESENÇAS
          </div>
        </div>
      </div>

      <div style={{
        opacity: phraseOpacity,
        marginTop: 44,
        fontFamily: 'Inter, system-ui',
        fontSize: 24,
        color: 'rgba(255,255,255,0.45)',
        fontStyle: 'italic',
        textAlign: 'center',
        maxWidth: 800,
        lineHeight: 1.4,
      }}>
        "{getRivalFrase(difference)}"
      </div>
    </AbsoluteFill>
  );
};
