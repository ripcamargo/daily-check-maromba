import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { FPS } from '../utils/sceneConfig';

const fmt = (v) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';

export const Scene12_Financeiro = ({ data }) => {
  const frame = useCurrentFrame();
  const { financialData, season } = data;

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  if (!financialData || season.finePerAbsence === 0) {
    return (
      <AbsoluteFill style={{
        background: '#0d0d0d',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px',
      }}>
        <div style={{
          opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 64 }}>💸</div>
          <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 48, color: '#10b981', letterSpacing: 3, marginTop: 16 }}>
            SEM MULTAS ESSA TEMPORADA
          </div>
          <div style={{ fontFamily: 'Inter, system-ui', fontSize: 22, color: 'rgba(255,255,255,0.35)', marginTop: 12, fontStyle: 'italic' }}>
            Treino por amor, não por medo. Respeitável.
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  const { totalArrecadado, totalDevido, saldoDevedor, maiorDevedor, maisHonesto } = financialData;

  const itemScale = (startF) =>
    spring({ frame: frame - startF, fps: FPS, config: { damping: 80, stiffness: 200 } });
  const itemOpacity = (startF) =>
    interpolate(frame, [startF, startF + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, #0d0d0d 0%, #001208 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px', gap: 0,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#10b981' }} />

      <div style={{ opacity: titleOpacity, textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 60 }}>💸</div>
        <div style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 64,
          color: '#10b981',
          letterSpacing: 3,
          lineHeight: 1,
        }}>
          RAIO X FINANCEIRO
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui',
          fontSize: 20,
          color: 'rgba(255,255,255,0.35)',
          marginTop: 8,
        }}>
          Multa de {fmt(season.finePerAbsence)} por falta
        </div>
      </div>

      <div style={{ display: 'flex', gap: 28, marginBottom: 36 }}>
        {[
          { label: 'ARRECADADO', value: totalArrecadado, color: '#10b981', startF: 20 },
          { label: 'DEVIDO', value: totalDevido, color: '#ef4444', startF: 35 },
          { label: 'EM DÍVIDA', value: saldoDevedor, color: '#f59e0b', startF: 50 },
        ].map((s) => (
          <div key={s.label} style={{
            opacity: itemOpacity(s.startF),
            transform: `scale(${itemScale(s.startF)})`,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 20,
            padding: '28px 32px',
            border: `1px solid ${s.color}33`,
            minWidth: 230,
          }}>
            <div style={{
              fontFamily: 'Bebas Neue, Impact, sans-serif',
              fontSize: 48,
              color: s.color,
              lineHeight: 1,
            }}>
              {fmt(s.value)}
            </div>
            <div style={{
              fontFamily: 'Inter, system-ui',
              fontSize: 16,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: 2,
              marginTop: 8,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 840 }}>
        {maiorDevedor && (
          <div style={{
            opacity: itemOpacity(80),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(239,68,68,0.07)',
            borderRadius: 14,
            padding: '16px 24px',
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <div>
              <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 36, color: '#ef4444', lineHeight: 1 }}>
                {maiorDevedor.name}
              </div>
              <div style={{ fontFamily: 'Inter, system-ui', fontSize: 16, color: 'rgba(255,255,255,0.35)', marginTop: 4, fontStyle: 'italic' }}>
                O generoso involuntário da temporada.
              </div>
            </div>
            <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 44, color: '#ef4444' }}>
              {fmt(maiorDevedor.debt)}
            </div>
          </div>
        )}

        {maisHonesto && (
          <div style={{
            opacity: itemOpacity(95),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(16,185,129,0.07)',
            borderRadius: 14,
            padding: '16px 24px',
            border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <div>
              <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 36, color: '#10b981', lineHeight: 1 }}>
                {maisHonesto.name}
              </div>
              <div style={{ fontFamily: 'Inter, system-ui', fontSize: 16, color: 'rgba(255,255,255,0.35)', marginTop: 4, fontStyle: 'italic' }}>
                Pagou tudo. Dívida zero. O honesto.
              </div>
            </div>
            <div style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: 36, color: '#10b981' }}>
              {fmt(maisHonesto.totalPaid)} ✅
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
