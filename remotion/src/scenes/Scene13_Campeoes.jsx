import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { AthleteAvatar } from '../components/AthleteAvatar';
import { FPS } from '../utils/sceneConfig';

export const Scene13_Campeoes = ({ data }) => {
  const frame = useCurrentFrame();
  const { champions, season } = data;
  const first = champions?.first;
  const second = champions?.second;
  const third = champions?.third;

  const bgOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const firstScale = spring({ frame: frame - 10, fps: FPS, config: { damping: 55, stiffness: 200 } });
  const firstOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const secondScale = spring({ frame: frame - 80, fps: FPS, config: { damping: 70, stiffness: 200 } });
  const secondOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const thirdScale = spring({ frame: frame - 130, fps: FPS, config: { damping: 70, stiffness: 200 } });
  const thirdOpacity = interpolate(frame, [130, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const confettiOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  if (!first) {
    return (
      <AbsoluteFill style={{
        background: '#0d0d0d',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px',
      }}>
        <div style={{
          opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 52, color: '#f5a623', letterSpacing: 3 }}>
            CAMPEÃO A DEFINIR
          </div>
          <div style={{ fontFamily: 'Inter, system-ui', fontSize: 22, color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>
            A temporada ainda não foi finalizada.
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, #0d0d0d 0%, #1a1000 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px', gap: 0,
    }}>
      {/* Gold top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'linear-gradient(90deg, #f5a623, #fff, #f5a623)' }} />

      {/* Confetti-like dots */}
      <div style={{ opacity: confettiOpacity, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 8, height: 8,
            borderRadius: '50%',
            background: ['#f5a623', '#fff', '#ef4444', '#10b981', '#8b5cf6'][i % 5],
            left: `${(i * 5.3) % 100}%`,
            top: `${(i * 7.7 + frame * 0.5) % 100}%`,
            opacity: 0.5,
          }} />
        ))}
      </div>

      {/* Header */}
      <div style={{
        opacity: bgOpacity,
        textAlign: 'center',
        marginBottom: 40,
      }}>
        <div style={{ fontSize: 56 }}>👑</div>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 36,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 6,
          marginTop: 8,
        }}>
          {season.title}
        </div>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 64,
          color: '#f5a623',
          letterSpacing: 3,
          lineHeight: 1,
        }}>
          CAMPEÃO
        </div>
      </div>

      {/* Champion card */}
      <div style={{
        opacity: firstOpacity,
        transform: `scale(${firstScale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        background: 'linear-gradient(135deg, rgba(245,166,35,0.15), rgba(245,166,35,0.03))',
        borderRadius: 28,
        padding: '36px 48px',
        border: '2px solid rgba(245,166,35,0.4)',
        marginBottom: 28,
        width: '100%',
        maxWidth: 700,
        textAlign: 'center',
        boxShadow: '0 0 60px rgba(245,166,35,0.15)',
      }}>
        <AthleteAvatar
          name={first.name}
          photoUrl={first.photoUrl}
          size={160}
          style={{ border: '4px solid #f5a623', boxShadow: '0 0 30px rgba(245,166,35,0.4)' }}
        />
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 72,
          color: '#f5a623',
          letterSpacing: 3,
          lineHeight: 1,
          textShadow: '0 0 30px rgba(245,166,35,0.5)',
        }}>
          {first.name}
        </div>
        <div style={{ display: 'flex', gap: 36 }}>
          {[
            { label: 'PRESENÇAS', value: first.stats?.present, color: '#10b981' },
            { label: 'FALTAS', value: first.stats?.absence, color: '#ef4444' },
            { label: 'XP', value: first.xp, color: '#f5a623' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 44, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'Inter, system-ui', fontSize: 14, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Runner up */}
      {second && (
        <div style={{
          opacity: secondOpacity,
          transform: `scale(${secondScale})`,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          background: 'rgba(156,163,175,0.07)',
          borderRadius: 20,
          padding: '20px 32px',
          border: '1px solid rgba(156,163,175,0.2)',
          width: '100%',
          maxWidth: 600,
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 40 }}>🥈</div>
          <AthleteAvatar name={second.name} photoUrl={second.photoUrl} size={80} style={{ border: '2px solid #9ca3af' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 40, color: '#9ca3af', lineHeight: 1 }}>
              {second.name}
            </div>
            <div style={{ fontFamily: 'Inter, system-ui', fontSize: 16, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
              VICE-CAMPEÃO · Prata da casa
            </div>
          </div>
          <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 44, color: '#9ca3af', lineHeight: 1 }}>
            {second.stats?.present}
          </div>
        </div>
      )}

      {/* Third place */}
      {third && (
        <div style={{
          opacity: thirdOpacity,
          transform: `scale(${thirdScale})`,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          background: 'rgba(180,100,30,0.07)',
          borderRadius: 20,
          padding: '16px 28px',
          border: '1px solid rgba(180,100,30,0.25)',
          width: '100%',
          maxWidth: 600,
        }}>
          <div style={{ fontSize: 36 }}>🥉</div>
          <AthleteAvatar name={third.name} photoUrl={third.photoUrl} size={68} style={{ border: '2px solid #cd7f32' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 34, color: '#cd7f32', lineHeight: 1 }}>
              {third.name}
            </div>
            <div style={{ fontFamily: 'Inter, system-ui', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              3º LUGAR · Medalha de bronze
            </div>
          </div>
          <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 38, color: '#cd7f32', lineHeight: 1 }}>
            {third.stats?.present}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
