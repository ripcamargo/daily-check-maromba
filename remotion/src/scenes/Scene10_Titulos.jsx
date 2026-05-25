import { AbsoluteFill, useCurrentFrame, interpolate, spring, Sequence } from 'remotion';
import { AthleteAvatar } from '../components/AthleteAvatar';
import { FPS } from '../utils/sceneConfig';

const TITLE_COLORS = [
  '#f5a623', '#ef4444', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#eab308', '#06b6d4',
  '#f97316', '#a3e635',
];

const TitleCard = ({ title, totalDuration }) => {
  const frame = useCurrentFrame();

  const enterDur = 12;
  const exitStart = totalDuration - 10;

  const opacity = interpolate(
    frame,
    [0, enterDur, exitStart, totalDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = spring({ frame, fps: FPS, config: { damping: 60, stiffness: 250 } });

  const nameY = interpolate(frame, [6, enterDur + 10], [30, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const nameOpacity = interpolate(frame, [6, enterDur + 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const titleY = interpolate(frame, [14, 30], [40, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const titleOpacity = interpolate(frame, [14, 30], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const statsOpacity = interpolate(frame, [28, 40], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const colorIdx = (title.athleteName?.charCodeAt(0) || 0) % TITLE_COLORS.length;
  const accent = TITLE_COLORS[colorIdx];

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `radial-gradient(ellipse at center, ${accent}18 0%, #0d0d0d 70%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
        gap: 0,
      }}
    >
      {/* Accent border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accent }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: accent }} />

      {/* Avatar */}
      <div style={{ transform: `scale(${scale})`, marginBottom: 32 }}>
        <AthleteAvatar
          name={title.athleteName}
          photoUrl={title.photoUrl}
          size={180}
          style={{ border: `4px solid ${accent}` }}
        />
      </div>

      {/* Name */}
      <div style={{
        opacity: nameOpacity,
        transform: `translateY(${nameY}px)`,
        fontFamily: 'Inter, system-ui',
        fontSize: 32,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 3,
        marginBottom: 12,
        textTransform: 'uppercase',
      }}>
        {title.athleteName}
      </div>

      {/* Divider */}
      <div style={{
        opacity: titleOpacity,
        fontFamily: 'Inter, system-ui',
        fontSize: 18,
        color: 'rgba(255,255,255,0.25)',
        letterSpacing: 4,
        marginBottom: 16,
      }}>
        RECEBE O TÍTULO DE
      </div>

      {/* The Title */}
      <div style={{
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        fontFamily: 'Bebas Neue, Impact, sans-serif',
        fontSize: 76,
        color: accent,
        letterSpacing: 4,
        lineHeight: 1,
        textAlign: 'center',
        textShadow: `0 0 40px ${accent}66`,
        maxWidth: 900,
      }}>
        {title.title}
      </div>

      {/* Stats */}
      <div style={{
        opacity: statsOpacity,
        display: 'flex',
        gap: 40,
        marginTop: 44,
        background: 'rgba(255,255,255,0.04)',
        padding: '16px 40px',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
        {[
          { label: 'PRESENÇAS', value: title.stats?.present, color: '#10b981' },
          { label: 'XP', value: title.xp, color: accent },
          { label: 'LEVEL XP', value: title.rank?.name, color: 'rgba(255,255,255,0.6)', isText: true },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{
              height: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: 'Bebas Neue, Impact, sans-serif',
                fontSize: s.isText ? 28 : 44,
                color: s.color,
                lineHeight: 1,
              }}>
                {s.value}
              </div>
            </div>
            <div style={{
              fontFamily: 'Inter, system-ui',
              fontSize: 14,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: 2,
              marginTop: 4,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Scene10_Titulos = ({ data, sceneDuration }) => {
  const frame = useCurrentFrame();
  const titles = data.titles || [];

  const HEADER_DUR = 30;
  const perTitle = Math.floor((sceneDuration - HEADER_DUR) / Math.max(titles.length, 1));

  const headerOpacity = interpolate(frame, [0, 15, 20, HEADER_DUR], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: '#0d0d0d' }}>
      {/* Section header (fades out before titles start) */}
      {frame < HEADER_DUR && (
        <AbsoluteFill style={{
          opacity: headerOpacity,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: '#0d0d0d',
        }}>
          <div style={{ fontSize: 64 }}>🏆</div>
          <div style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 72,
            color: '#fff',
            letterSpacing: 4,
            marginTop: 16,
          }}>
            TÍTULOS DA TEMPORADA
          </div>
          <div style={{
            fontFamily: 'Inter, system-ui',
            fontSize: 22,
            color: 'rgba(255,255,255,0.35)',
            marginTop: 8,
          }}>
            Cada um recebe o que merece.
          </div>
        </AbsoluteFill>
      )}

      {/* Individual title cards */}
      {titles.map((title, i) => {
        const start = HEADER_DUR + i * perTitle;
        return (
          <Sequence key={title.athleteId} from={start} durationInFrames={perTitle}>
            <TitleCard title={title} totalDuration={perTitle} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
