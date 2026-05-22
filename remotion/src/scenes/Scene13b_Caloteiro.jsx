import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { AthleteAvatar } from '../components/AthleteAvatar';
import { FPS } from '../utils/sceneConfig';

const fmt = (v) =>
  (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function getCaloteiroFrase(debt, absences) {
  if (debt > 200) return 'Esse cara é um patrimônio da inadimplência.';
  if (debt > 100) return 'Deve mais do que treinou. Talento raro.';
  if (debt > 50) return 'A conta chegou. E continua esperando.';
  if (absences >= 10) return `${absences} faltas e nem quis saber do preço.`;
  return 'Pequeno em presenças, grande em dívidas.';
}

export const Scene13b_Caloteiro = ({ data }) => {
  const frame = useCurrentFrame();
  const devedores = data.financialData?.devedores || [];
  const finePerAbsence = data.season?.finePerAbsence || 0;

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const noneOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Sem sistema de multas configurado
  if (finePerAbsence === 0) {
    return (
      <AbsoluteFill style={{
        background: '#0d0d0d',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '0 60px',
      }}>
        <div style={{ opacity: noneOpacity, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🤷</div>
          <div style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 48, color: '#9ca3af', letterSpacing: 3,
          }}>
            SEM SISTEMA DE MULTAS
          </div>
          <div style={{
            fontFamily: 'Inter, system-ui', fontSize: 20,
            color: 'rgba(255,255,255,0.35)', marginTop: 12, fontStyle: 'italic',
          }}>
            Essa temporada não tinha cobrança de faltas.
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // Todo mundo em dia
  if (devedores.length === 0) {
    return (
      <AbsoluteFill style={{
        background: '#0d0d0d',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '0 60px',
      }}>
        <div style={{ opacity: noneOpacity, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
          <div style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 56, color: '#10b981', letterSpacing: 3,
          }}>
            TODO MUNDO PAGOU
          </div>
          <div style={{
            fontFamily: 'Inter, system-ui', fontSize: 22,
            color: 'rgba(255,255,255,0.35)', marginTop: 12, fontStyle: 'italic',
          }}>
            Nenhum caloteiro essa temporada. Milagre.
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  const top = devedores[0];
  const rest = devedores.slice(1, 4);

  const heroScale = spring({ frame: frame - 20, fps: FPS, config: { damping: 55, stiffness: 180 } });
  const heroOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const debtOpacity = interpolate(frame, [55, 80], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const debtScale = spring({ frame: frame - 55, fps: FPS, config: { damping: 40, stiffness: 350 } });
  const fraseOpacity = interpolate(frame, [90, 115], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, #0d0d0d 0%, #1a0a00 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 50px', gap: 0,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #ef4444, #f97316)' }} />

      {/* Title */}
      <div style={{ opacity: titleOpacity, textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 52 }}>💸</div>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 36, color: 'rgba(255,255,255,0.35)',
          letterSpacing: 6, marginTop: 8,
        }}>
          PRÊMIO ESPECIAL DA TEMPORADA
        </div>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 68, color: '#f97316',
          letterSpacing: 3, lineHeight: 1,
        }}>
          MAIOR CALOTEIRO
        </div>
      </div>

      {/* Hero card */}
      <div style={{
        opacity: heroOpacity,
        transform: `scale(${heroScale})`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(249,115,22,0.05))',
        borderRadius: 28, padding: '32px 48px',
        border: '2px solid rgba(239,68,68,0.35)',
        width: '100%', maxWidth: 680, textAlign: 'center',
        boxShadow: '0 0 60px rgba(239,68,68,0.1)',
        marginBottom: 24,
      }}>
        <AthleteAvatar
          name={top.name}
          photoUrl={top.photoUrl}
          size={140}
          style={{ border: '4px solid #ef4444', boxShadow: '0 0 24px rgba(239,68,68,0.4)' }}
        />
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 64, color: '#ef4444', letterSpacing: 2, lineHeight: 1,
        }}>
          {top.name}
        </div>

        {/* Debt amount — pops in */}
        <div style={{ opacity: debtOpacity, transform: `scale(${debtScale})` }}>
          <div style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 88, color: '#f97316', lineHeight: 1,
            textShadow: '0 0 30px rgba(249,115,22,0.5)',
          }}>
            {fmt(top.debt)}
          </div>
          <div style={{
            fontFamily: 'Inter, system-ui', fontSize: 18,
            color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginTop: 4,
          }}>
            ainda em aberto · {top.absences} falta{top.absences !== 1 ? 's' : ''} · pagou {fmt(top.totalPaid)} de {fmt(top.totalOwed)}
          </div>
        </div>

        {/* Frase */}
        <div style={{
          opacity: fraseOpacity,
          fontFamily: 'Inter, system-ui', fontSize: 22,
          color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', marginTop: 8,
        }}>
          "{getCaloteiroFrase(top.debt, top.absences)}"
        </div>
      </div>

      {/* Other debtors */}
      {rest.length > 0 && (
        <div style={{
          opacity: interpolate(frame, [130, 155], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          display: 'flex', gap: 16, width: '100%', maxWidth: 680,
        }}>
          {rest.map((d, i) => {
            const startF = 135 + i * 12;
            const op = interpolate(frame, [startF, startF + 12], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            return (
              <div key={d.id} style={{
                opacity: op, flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: 'rgba(239,68,68,0.05)', borderRadius: 16, padding: '14px 16px',
                border: '1px solid rgba(239,68,68,0.15)',
              }}>
                <AthleteAvatar name={d.name} photoUrl={d.photoUrl} size={64} />
                <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 26, color: '#fff', lineHeight: 1, textAlign: 'center' }}>
                  {d.name}
                </div>
                <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 30, color: '#f97316' }}>
                  {fmt(d.debt)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};
