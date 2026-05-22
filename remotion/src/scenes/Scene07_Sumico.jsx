import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { AthleteAvatar } from '../components/AthleteAvatar';
import { FPS } from '../utils/sceneConfig';

function getGapTitle(days) {
  if (days < 5) return 'Micro ausência';
  if (days < 11) return 'Hiato espiritual';
  if (days < 21) return 'Férias não declaradas';
  if (days < 41) return 'Aposentadoria prematura';
  return 'ARQUEOLOGIA MUSCULAR';
}

function getGapFrase(days) {
  if (days < 5) return 'Respeitável. Mal deu pra sentir.';
  if (days < 11) return 'Uma semana de silêncio. Acontece.';
  if (days < 21) return 'O que aconteceu nesse período? Só ele sabe.';
  if (days < 41) return 'Um mês inteiro sem sinal. Ousado.';
  return 'Os arqueólogos tentam reconstruir o que aconteceu.';
}

const formatDate = (d) => {
  if (!d) return '?';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch { return d; }
};

export const Scene07_Sumico = ({ data }) => {
  const frame = useCurrentFrame();
  const { biggestDisappearance, bestStreak } = data;

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const flatlineProgress = interpolate(frame, [20, 90], [0, 100], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const contentOpacity = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const returnOpacity = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const returnScale = spring({ frame: frame - 110, fps: FPS, config: { damping: 60, stiffness: 250 } });

  const streakOpacity = interpolate(frame, [150, 175], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  if (!biggestDisappearance) {
    return (
      <AbsoluteFill style={{
        background: '#0d0d0d',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px',
      }}>
        <div style={{ opacity: contentOpacity, textAlign: 'center' }}>
          <div style={{ fontSize: 64 }}>🏃</div>
          <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 48, color: '#10b981', letterSpacing: 3, marginTop: 16 }}>
            PRESENÇA CONSTANTE
          </div>
          <div style={{ fontFamily: 'Inter, system-ui', fontSize: 22, color: 'rgba(255,255,255,0.35)', marginTop: 12, fontStyle: 'italic' }}>
            Nenhum sumiço relevante essa temporada.
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  const { athlete, days, from, to } = biggestDisappearance;
  const returned = !!to;

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, #0d0d0d 0%, #1a0000 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px', gap: 0,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#ef4444' }} />

      <div style={{ opacity: titleOpacity, textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 36,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 6,
        }}>
          MAIOR DESAPARECIMENTO DA TEMPORADA
        </div>
      </div>

      <div style={{ opacity: contentOpacity, textAlign: 'center', marginBottom: 32 }}>
        <AthleteAvatar
          name={athlete.name}
          photoUrl={athlete.photoUrl}
          size={140}
          style={{ margin: '0 auto', border: '3px solid rgba(239,68,68,0.5)' }}
        />
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 68,
          color: '#ef4444',
          letterSpacing: 2,
          lineHeight: 1,
          marginTop: 16,
        }}>
          {athlete.name}
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 24,
          color: 'rgba(255,255,255,0.5)',
          marginTop: 4,
          letterSpacing: 1,
        }}>
          {getGapTitle(days)}
        </div>
      </div>

      {/* Flatline animation */}
      <div style={{
        opacity: contentOpacity,
        width: '100%',
        maxWidth: 800,
        height: 60,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 24,
      }}>
        <svg width="100%" height="60" viewBox="0 0 800 60">
          <polyline
            points={`0,30 ${flatlineProgress * 3},30 ${flatlineProgress * 3 + 10},10 ${flatlineProgress * 3 + 20},50 ${flatlineProgress * 3 + 30},30 800,30`}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            opacity="0.6"
          />
        </svg>
      </div>

      <div style={{ opacity: contentOpacity, textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 96,
          color: '#ef4444',
          lineHeight: 1,
        }}>
          {days} DIAS
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 22,
          color: 'rgba(255,255,255,0.4)',
          marginTop: 4,
        }}>
          {formatDate(from)} → {to ? formatDate(to) : 'sem retorno'}
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 20,
          color: 'rgba(255,255,255,0.3)',
          fontStyle: 'italic',
          marginTop: 8,
        }}>
          "{getGapFrase(days)}"
        </div>
      </div>

      {returned && (
        <div style={{
          opacity: returnOpacity,
          transform: `scale(${returnScale})`,
          textAlign: 'center',
          padding: '20px 40px',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 16,
          marginBottom: 20,
        }}>
          <div style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 36,
            color: '#b97510',
            letterSpacing: 3,
          }}>
            {/*MAS COMO TODO BOM PERSONAGEM... VOLTOU.*/}
            E logo após, desistiu! 😔
          </div>
        </div>
      )}
    
{/*
      {bestStreak && (
        <div style={{ opacity: streakOpacity, textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Inter, system-ui',
            fontSize: 20,
            color: 'rgba(255,255,255,0.35)',
          }}>
            Maior streak da temporada: <span style={{ color: '#f5a623', fontWeight: 700 }}>
              {bestStreak.athlete.name} — {bestStreak.streak} dias seguidos 🔥
            </span>
          </div>
        </div>
      )}*/}
    </AbsoluteFill>
    
  );
};
