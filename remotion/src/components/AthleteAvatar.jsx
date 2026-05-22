import { AbsoluteFill, Img } from 'remotion';

export const AthleteAvatar = ({ name, photoUrl, size = 120, style = {} }) => {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;
  const bg = colors[colorIdx];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        border: '3px solid rgba(255,255,255,0.2)',
        ...style,
      }}
    >
      {photoUrl ? (
        <Img
          src={photoUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: size * 0.38,
            color: '#fff',
            letterSpacing: 1,
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
};
