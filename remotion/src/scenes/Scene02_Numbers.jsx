import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { FPS } from '../utils/sceneConfig';

const STATS = [
  { key: 'totalPresencas', label: 'PRESENÇAS', color: '#10b981', emoji: '✅' },
  { key: 'totalFaltas', label: 'FALTAS', color: '#ef4444', emoji: '❌' },
  { key: 'totalHospital', label: 'IDA AO HOSPITAL', color: '#f59e0b', emoji: '🚑' },
  { key: 'totalExtra', label: 'TREINOS EXTRAS', color: '#eab308', emoji: '⭐' },
  { key: 'totalRest', label: 'FOLGAS', color: '#3b82f6', emoji: '🔷' },
];

export const Scene02_Numbers = ({ data }) => {
  const frame = useCurrentFrame();
  const { groupStats } = data;

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const phraseOpacity = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d0d0d 0%, #111 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
        gap: 0,
      }}
    >
      <div style={{
        opacity: titleOpacity,
        fontFamily: 'Bebas Neue, Impact, sans-serif',
        fontSize: 36,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 6,
        marginBottom: 48,
      }}>
        OS NÚMEROS DA TEMPORADA
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%', maxWidth: 880 }}>
        {STATS.map((stat, i) => {
          const startF = 20 + i * 20;
          const endF = startF + 50;

          const itemOpacity = interpolate(frame, [startF, startF + 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const itemX = interpolate(frame, [startF, startF + 12], [-60, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const barScale = spring({
            frame: frame - startF,
            fps: FPS,
            config: { damping: 80, stiffness: 150 },
          });

          const value = groupStats[stat.key] || 0;
          const maxVal = groupStats.totalPresencas || 1;
          const barWidth = Math.max(4, (value / (maxVal * 1.1)) * 100);

          return (
            <div
              key={stat.key}
              style={{
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{
                  fontFamily: 'Inter, system-ui',
                  fontSize: 20,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: 2,
                }}>
                  {stat.emoji} {stat.label}
                </div>
                <AnimatedCounter
                  to={value}
                  startFrame={startF}
                  endFrame={endF}
                  style={{
                    fontFamily: 'Bebas Neue, Impact, sans-serif',
                    fontSize: 48,
                    color: stat.color,
                    lineHeight: 1,
                  }}
                />
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${barWidth * barScale}%`,
                  background: stat.color,
                  borderRadius: 3,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Group phrase */}
      <div style={{
        opacity: phraseOpacity,
        marginTop: 56,
        textAlign: 'center',
        fontFamily: 'Inter, system-ui',
        fontSize: 26,
        color: 'rgba(255,255,255,0.5)',
        fontStyle: 'italic',
        maxWidth: 800,
        lineHeight: 1.4,
      }}>
        "{groupStats.grupoFrase}"
      </div>

      <div style={{
        opacity: phraseOpacity,
        marginTop: 20,
        fontFamily: 'Bebas Neue, Impact, sans-serif',
        fontSize: 38,
        color: '#f5a623',
        letterSpacing: 3,
      }}>
        {groupStats.presencaGeralPct}% DE PRESENÇA GERAL
      </div>
    </AbsoluteFill>
  );
};
