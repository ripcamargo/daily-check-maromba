import { AbsoluteFill, useCurrentFrame, spring, interpolate, Img } from 'remotion';
import { FPS } from '../utils/sceneConfig';

export const Scene01_Opening = ({ data }) => {
  const frame = useCurrentFrame();
  const { season, groupStats } = data;

  const logoScale = spring({ frame, fps: FPS, config: { damping: 60, stiffness: 200 } });

  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [20, 40], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const datesOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const statsOpacity = interpolate(frame, [65, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const formatDate = (d) => {
    if (!d) return '';
    try {
      const dateStr = String(d).substring(0, 10);
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(d);
    }
  };

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d0d0d 0%, #1a1a2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        padding: '0 60px',
      }}
    >
      {/* Decorative top line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 4,
        background: 'linear-gradient(90deg, #f5a623, #ff6b35, #f5a623)',
      }} />

      {/* Logo */}
      <div style={{ transform: `scale(${logoScale})`, marginBottom: 40 }}>
        {season.logoUrl ? (
          <Img
            src={season.logoUrl}
            style={{ width: 160, height: 160, borderRadius: '50%', objectFit: 'cover', border: '4px solid #f5a623' }}
          />
        ) : (
          <div style={{
            width: 160, height: 160, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f5a623, #ff6b35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 64,
          }}>
            🏋️
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        textAlign: 'center',
        marginBottom: 20,
      }}>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 72,
          color: '#fff',
          lineHeight: 1,
          letterSpacing: 4,
        }}>
          {season.title || 'GYM WRAPPED'}
        </div>
      </div>

      {/* Dates */}
      <div style={{
        opacity: datesOpacity,
        fontFamily: 'Inter, system-ui',
        fontSize: 24,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 2,
        marginBottom: 60,
      }}>
        {formatDate(season.startDate)} → {formatDate(season.endDate)}
      </div>

      {/* Stats bar */}
      <div style={{
        opacity: statsOpacity,
        display: 'flex',
        gap: 48,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: '24px 40px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {[
          { label: 'ATLETAS', value: groupStats.totalAtletas },
          { label: 'DIAS', value: groupStats.totalDias },
          { label: 'PRESENÇAS', value: groupStats.totalPresencas },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Bebas Neue, Impact, sans-serif',
              fontSize: 54,
              color: '#f5a623',
              lineHeight: 1,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontFamily: 'Inter, system-ui',
              fontSize: 18,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: 2,
              marginTop: 4,
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div style={{
        opacity: statsOpacity,
        fontFamily: 'Inter, system-ui',
        fontSize: 22,
        color: 'rgba(255,255,255,0.35)',
        fontStyle: 'italic',
        marginTop: 40,
        textAlign: 'center',
      }}>
        "Uma história. Dados reais. Sem filtro."
      </div>

      {/* Bottom line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 4,
        background: 'linear-gradient(90deg, #f5a623, #ff6b35, #f5a623)',
      }} />
    </AbsoluteFill>
  );
};
