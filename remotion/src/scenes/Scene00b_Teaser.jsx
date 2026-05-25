import { AbsoluteFill, useCurrentFrame, interpolate, Sequence } from 'remotion';
import { SCENE_DURATIONS } from '../utils/sceneConfig';

const FADE_IN = 16;
const FADE_OUT = 14;

const REVEAL_FRAMES = 95; // revealFadeIn(20) + revealHold(55) + revealFadeOut(20)

const BASE_BEATS = [
  {
    main: 'Uma temporada inteira.',
    sub: null,
    mainSize: 84,
    subSize: null,
    color: '#ffffff',
    subColor: null,
    italic: false,
    duration: 62,
  },
  {
    main: 'Cada dia de exercício foi contado.',
    sub: 'Cada presença. Cada falta. Cada drama.',
    mainSize: 52,
    subSize: 38,
    color: 'rgba(255,255,255,0.85)',
    subColor: 'rgba(255,255,255,0.45)',
    italic: false,
    duration: 68,
  },
  {
    main: 'Teve quem chegou antes do sol raiar.',
    sub: 'E teve quem... bom, você vai ver.',
    mainSize: 50,
    subSize: 38,
    color: 'rgba(255,255,255,0.8)',
    subColor: 'rgba(255,255,255,0.4)',
    italic: true,
    duration: 72,
  },
  {
    main: 'Suor, recordes pessoais,',
    sub: 'sumiços inexplicáveis e desculpas bem criativas.',
    mainSize: 52,
    subSize: 40,
    color: '#f5a623',
    subColor: 'rgba(245,166,35,0.65)',
    italic: false,
    duration: 72,
  },
  {
    main: 'Nada foi esquecido.',
    sub: 'Os dados não mentem.',
    mainSize: 66,
    subSize: 36,
    color: '#ffffff',
    subColor: 'rgba(255,255,255,0.35)',
    italic: false,
    duration: 65,
  },
  {
    main: 'Fracassos, vitórias e tudo mais',
    sub: 'que aconteceu entre uma série e outra.',
    mainSize: 50,
    subSize: 38,
    color: 'rgba(255,255,255,0.8)',
    subColor: 'rgba(255,255,255,0.4)',
    italic: true,
    duration: 68,
  },
  {
    main: 'É hora de relembrar.',
    sub: 'Sem filtro. Sem piedade. Só a verdade.',
    mainSize: 72,
    subSize: 34,
    color: '#ffffff',
    subColor: 'rgba(255,255,255,0.5)',
    italic: false,
    duration: 85,
  },
];

const BASE_BEATS_TOTAL = BASE_BEATS.reduce((s, b) => s + b.duration, 0);
const BEATS_SCALE = (SCENE_DURATIONS.teaser - REVEAL_FRAMES) / BASE_BEATS_TOTAL;
const BEATS = BASE_BEATS.map((b) => ({ ...b, duration: Math.round(b.duration * BEATS_SCALE) }));

const Beat = ({ main, sub, mainSize, subSize, color, subColor, italic, duration }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, FADE_IN, duration - FADE_OUT, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = interpolate(frame, [0, duration], [0.93, 1.08], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const subOpacity = interpolate(frame, [FADE_IN + 8, FADE_IN + 22], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const subY = interpolate(frame, [FADE_IN + 8, FADE_IN + 22], [16, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      opacity,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 80px',
      gap: 0,
    }}>
      <div style={{
        transform: `scale(${scale})`,
        fontFamily: 'Bebas Neue, Impact, sans-serif',
        fontSize: mainSize,
        color,
        letterSpacing: 3,
        lineHeight: 1.05,
        textAlign: 'center',
        fontStyle: italic ? 'italic' : 'normal',
      }}>
        {main}
      </div>

      {sub && (
        <div style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          fontFamily: 'Inter, system-ui',
          fontSize: subSize,
          color: subColor,
          letterSpacing: 1,
          lineHeight: 1.4,
          textAlign: 'center',
          fontStyle: italic ? 'italic' : 'normal',
          marginTop: 18,
        }}>
          {sub}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Scene00b_Teaser = ({ data }) => {
  const frame = useCurrentFrame();
  const seasonTitle = data?.season?.title || 'GYM WRAPPED';

  const totalBeats = BEATS.reduce((s, b) => s + b.duration, 0);
  const revealStart = totalBeats;
  const revealFadeIn = 20;
  const revealHold = 55;
  const revealFadeOut = 20;

  const revealOpacity = interpolate(
    frame,
    [revealStart, revealStart + revealFadeIn, revealStart + revealFadeIn + revealHold, revealStart + revealFadeIn + revealHold + revealFadeOut],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const revealScale = interpolate(frame, [revealStart, revealStart + revealFadeIn + 10], [0.88, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const subtitleOpacity = interpolate(frame, [revealStart + revealFadeIn + 5, revealStart + revealFadeIn + 22], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const pulseOpacity = interpolate(
    frame % 40,
    [0, 20, 40],
    [0.3, 1, 0.3],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const showPulse = frame >= revealStart + revealFadeIn && frame < revealStart + revealFadeIn + revealHold;

  let cursor = 0;

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* Thin gold line top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, transparent, #f5a623, transparent)',
        opacity: 0.6,
      }} />

      {/* Beats */}
      {BEATS.map((beat, i) => {
        const start = cursor;
        cursor += beat.duration;
        return (
          <Sequence key={i} from={start} durationInFrames={beat.duration}>
            <Beat {...beat} />
          </Sequence>
        );
      })}

      {/* Final reveal: season title */}
      <AbsoluteFill style={{
        opacity: revealOpacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
        gap: 0,
      }}>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 20,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: 6,
          marginBottom: 16,
          opacity: subtitleOpacity,
        }}>
          APRESENTA
        </div>

        <div style={{
          transform: `scale(${revealScale})`,
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 96,
          color: '#fff',
          letterSpacing: 6,
          lineHeight: 1,
          textAlign: 'center',
          textShadow: '0 0 60px rgba(245,166,35,0.3)',
        }}>
          {seasonTitle}
        </div>

        <div style={{
          opacity: subtitleOpacity,
          fontFamily: 'Inter, system-ui',
          fontSize: 22,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 8,
          marginTop: 20,
          textTransform: 'uppercase',
        }}>
          Retrospectiva 
        </div>

        {showPulse && (
          <div style={{
            opacity: pulseOpacity,
            marginTop: 60,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#f5a623',
          }} />
        )}
      </AbsoluteFill>

      {/* Thin gold line bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, transparent, #f5a623, transparent)',
        opacity: 0.6,
      }} />
    </AbsoluteFill>
  );
};
