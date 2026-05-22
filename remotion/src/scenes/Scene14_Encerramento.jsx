import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img } from 'remotion';
import { FPS } from '../utils/sceneConfig';

function getEncerramentoFrase(pct) {
  if (pct >= 75) return 'Esse grupo é sério. Até a próxima.';
  if (pct >= 50) return 'Poderia ser pior. E provavelmente será.';
  return 'A academia agradece pela presença ocasional.';
}

const formatDate = (d) => {
  if (!d) return '';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return d; }
};

export const Scene14_Encerramento = ({ data }) => {
  const frame = useCurrentFrame();
  const { season, groupStats } = data;

  const bgOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const titleScale = spring({ frame: frame - 10, fps: FPS, config: { damping: 70, stiffness: 180 } });
  const titleOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const statsOpacity = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const phraseOpacity = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const phraseY = interpolate(frame, [80, 110], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const logoOpacity = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [160, 180], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, #0d0d0d 0%, #000 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px', gap: 0,
      opacity: fadeOut,
    }}>
      {/* Gold top border with fade */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, #f5a623, transparent)' }} />

      {/* Season title */}
      <div style={{
        opacity: titleOpacity,
        transform: `scale(${titleScale})`,
        textAlign: 'center',
        marginBottom: 16,
      }}>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 22,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: 4,
          marginBottom: 8,
        }}>
          TEMPORADA ENCERRADA
        </div>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 86,
          color: '#fff',
          letterSpacing: 4,
          lineHeight: 1,
          textShadow: '0 0 40px rgba(255,255,255,0.15)',
        }}>
          {season.title}
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 20,
          color: 'rgba(255,255,255,0.3)',
          marginTop: 12,
          letterSpacing: 2,
        }}>
          {formatDate(season.startDate)} → {formatDate(season.endDate)}
        </div>
      </div>

      {/* Stats summary */}
      <div style={{
        opacity: statsOpacity,
        display: 'flex',
        gap: 0,
        margin: '40px 0',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
      }}>
        {[
          { label: 'ATLETAS', value: groupStats.totalAtletas, color: '#8b5cf6' },
          { label: 'DIAS', value: groupStats.totalDias, color: '#3b82f6' },
          { label: 'PRESENÇAS', value: groupStats.totalPresencas, color: '#10b981' },
          { label: 'PRESENÇA', value: `${groupStats.presencaGeralPct}%`, color: '#f5a623' },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '24px 36px',
            textAlign: 'center',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <div style={{
              fontFamily: 'Bebas Neue, Impact, sans-serif',
              fontSize: 52,
              color: s.color,
              lineHeight: 1,
            }}>
              {s.value}
            </div>
            <div style={{
              fontFamily: 'Inter, system-ui',
              fontSize: 14,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: 2,
              marginTop: 6,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Phrase */}
      <div style={{
        opacity: phraseOpacity,
        transform: `translateY(${phraseY}px)`,
        textAlign: 'center',
        marginBottom: 40,
      }}>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 26,
          color: 'rgba(255,255,255,0.5)',
          fontStyle: 'italic',
          lineHeight: 1.4,
        }}>
          "{getEncerramentoFrase(groupStats.presencaGeralPct)}"
        </div>
      </div>

      {/* Logo / branding */}
      <div style={{ opacity: logoOpacity, textAlign: 'center' }}>
        {season.logoUrl ? (
          <Img src={season.logoUrl} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />
        ) : (
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️</div>
        )}
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 28,
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: 4,
        }}>
          GYM WRAPPED · {season.title}
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 14,
          color: 'rgba(255,255,255,0.12)',
          letterSpacing: 2,
          marginTop: 6,
        }}>
          gerado pelo Daily Check Maromba
        </div>
      </div>

      {/* Bottom border */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, #f5a623, transparent)' }} />
    </AbsoluteFill>
  );
};
