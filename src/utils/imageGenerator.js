import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAllCheckins, CheckinStatus, CalculatedStatus, StatusEmoji } from '../services/checkins';

/**
 * Abrevia nomes compostos mantendo apenas a inicial dos primeiros nomes
 * Exemplo: "Fernando Camargo" -> "F. Camargo"
 * Exemplo: "Giovane Souza Morais" -> "G. S. Morais"
 */
const abbreviateName = (fullName) => {
  const parts = fullName.trim().split(' ').filter(p => p.length > 0);
  
  if (parts.length === 1) {
    return parts[0];
  }
  
  // Abrevia todos exceto o último
  const abbreviated = parts.slice(0, -1).map(part => part[0].toUpperCase() + '.').join(' ');
  const lastName = parts[parts.length - 1];
  
  return `${abbreviated} ${lastName}`;
};

/**
 * Gera imagem da semana atual para compartilhamento
 */
export const generateWeeklyImage = async (season, athletes, backgroundImageUrl, startDate, endDate) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Criar canvas
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');

      // Carregar imagem de background
      const bgImage = new Image();
      bgImage.crossOrigin = 'anonymous';
      
      bgImage.onload = async () => {
        // Desenhar background
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        // Configurações de estilo
        const startX = 50;
        const startY = 180;
        const cellWidth = 70;
        const cellHeight = 70;
        const headerHeight = 50;

        // Obter dados da semana (usar datas filtradas se fornecidas)
        let weekStart, weekEnd, weekDays;
        
        if (startDate && endDate) {
          // Usar datas filtradas
          const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
          const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
          weekStart = new Date(startYear, startMonth - 1, startDay);
          weekEnd = new Date(endYear, endMonth - 1, endDay);
          weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        } else {
          // Usar semana atual
          const today = new Date();
          weekStart = startOfWeek(today, { locale: ptBR });
          weekEnd = endOfWeek(today, { locale: ptBR });
          weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        }

        // Buscar check-ins da semana
        const checkins = await getAllCheckins(season.id);
        
        // Formatar datas para comparação (yyyy-MM-dd)
        const formatDateStr = (date) => format(date, 'yyyy-MM-dd');
        const startStr = formatDateStr(weekStart);
        const endStr = formatDateStr(weekEnd);
        
        const weekCheckins = checkins.filter(checkin => {
          return checkin.date >= startStr && checkin.date <= endStr;
        });

        // Desenhar título com período
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Segoe UI';
        ctx.textAlign = 'center';
        const title = `${format(weekStart, 'dd', { locale: ptBR })} a ${format(weekEnd, 'dd \'de\' MMMM', { locale: ptBR })}`;
        ctx.fillText(title, canvas.width / 2, 80);

        // Desenhar cabeçalho dos dias da semana
        ctx.font = 'bold 18px Segoe UI';
        const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        daysOfWeek.forEach((day, index) => {
          const x = startX + 120 + (index * cellWidth) + (cellWidth / 2);
          ctx.fillText(day, x, startY - 10);
        });

        // Desenhar grid para cada atleta
        const sortedAthletes = [...athletes].sort((a, b) => a.name.localeCompare(b.name));
        
        sortedAthletes.forEach((athlete, athleteIndex) => {
          const y = startY + (athleteIndex * cellHeight);

          // Nome do atleta (abreviado)
          ctx.font = 'bold 20px Segoe UI';
          ctx.textAlign = 'left';
          ctx.fillStyle = '#ffffff';
          const abbreviatedName = abbreviateName(athlete.name);
          ctx.fillText(abbreviatedName, startX, y + 35);

          // Desenhar células dos dias
          weekDays.forEach((day, dayIndex) => {
            const x = startX + 120 + (dayIndex * cellWidth);
            const dateStr = format(day, 'yyyy-MM-dd');
            
            // Buscar check-in do dia
            const dayCheckin = weekCheckins.find(c => c.date === dateStr);
            const status = dayCheckin?.athletes?.[athlete.id]?.status || CheckinStatus.NOT_SET;

            // Desenhar célula de fundo
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x, y, cellWidth - 5, cellHeight - 5);

            // Desenhar emoji do status (vazio se não definido)
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            
            if (status !== CheckinStatus.NOT_SET) {
              const emoji = getStatusEmoji(status);
              ctx.fillText(emoji, x + (cellWidth / 2) - 2, y + 40);
            }
            // Se NOT_SET, deixa célula vazia (sem "FREE")
          });
        });

        // Adicionar logo no rodapé se houver
        if (season.logoUrl) {
          try {
            const logo = new Image();
            logo.crossOrigin = 'anonymous';
            logo.onload = () => {
              const logoSize = 120;
              const logoX = (canvas.width - logoSize) / 2;
              const logoY = canvas.height - logoSize - 30;
              ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
              
              // Converter para blob e resolver
              canvas.toBlob((blob) => {
                resolve(blob);
              }, 'image/png');
            };
            logo.onerror = () => {
              // Se falhar ao carregar logo, continua sem ele
              canvas.toBlob((blob) => {
                resolve(blob);
              }, 'image/png');
            };
            logo.src = season.logoUrl;
          } catch (error) {
            // Continua sem logo se houver erro
            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/png');
          }
        } else {
          // Sem logo, finaliza
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');
        }
      };

      bgImage.onerror = () => {
        reject(new Error('Erro ao carregar imagem de background'));
      };

      // Se não tiver background, usa cor sólida
      if (!backgroundImageUrl) {
        // Desenhar background com cor
        ctx.fillStyle = '#2c5f6f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        bgImage.onload(); // Chamar diretamente para processar
      } else {
        bgImage.src = backgroundImageUrl;
      }

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Retorna emoji adequado para cada status
 */
const getStatusEmoji = (status) => {
  const emojiMap = {
    [CheckinStatus.PRESENT]: '✅',
    [CheckinStatus.HOSPITAL]: '🚑',
    [CheckinStatus.JUSTIFIED]: '📄',
    [CalculatedStatus.REST]: '🔷',
    [CalculatedStatus.ABSENCE]: '❌',
    [CalculatedStatus.EXTRA]: '⭐',
    [CheckinStatus.NOT_SET]: '-'
  };
  return emojiMap[status] || '-';
};

/**
 * Faz download da imagem gerada
 */
export const downloadWeeklyImage = (blob, seasonTitle) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${seasonTitle}_${format(new Date(), 'yyyy-MM-dd')}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Gera imagem de classificação da temporada
 * Mostra: posição, foto, nome, total de presenças e últimos 7 check-ins
 */
export const generateRankingImage = async (season, rankedAthletes, allCheckins) => {
  // ── Layout constants ──────────────────────────────────────────────
  const W            = 660;
  const ROW_H        = 70;
  const HEADER_H     = 152;
  const COL_HEADER_H = 38;
  const H            = HEADER_H + COL_HEADER_H + rankedAthletes.length * ROW_H + 10;

  // Column centers / starts
  const POS_CX   = 26;
  const PHOTO_CX = 84;
  const NAME_X   = 118;
  const NAME_MAX = 138;
  const PRES_CX  = 280;   // presences — green
  const FALT_CX  = 334;   // absences  — red
  const DESC_CX  = 388;   // rest days — blue

  // Last-5 circles: 4 small (older) + 1 large (newest, highlighted)
  // Built right-to-left from x=700
  const SMALL_D       = 28;
  const LARGE_D       = 38;
  const CIRC_GAP      = 9;
  const PRE_LARGE_GAP = 13;
  const LARGE_CX      = W - 26 - LARGE_D / 2;
  const SMALL3_CX     = LARGE_CX - LARGE_D / 2 - PRE_LARGE_GAP - SMALL_D / 2;
  const SMALL2_CX     = SMALL3_CX - (SMALL_D + CIRC_GAP);
  const SMALL1_CX     = SMALL2_CX - (SMALL_D + CIRC_GAP);
  const SMALL0_CX     = SMALL1_CX - (SMALL_D + CIRC_GAP);
  const SMALL_CXS     = [SMALL0_CX, SMALL1_CX, SMALL2_CX, SMALL3_CX];
  const LAST5_HEADER_MX = (SMALL0_CX + LARGE_CX) / 2;

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Helpers ───────────────────────────────────────────────────────
  const loadImg = (src) => new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

  const clipCircle = (cx, cy, r, draw) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    draw();
    ctx.restore();
  };

  const drawInitials = (name, cx, cy, r, bgColor) => {
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    const initials = name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(r * 0.75)}px Segoe UI`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, cx, cy + 1);
  };

  // ── Preload athlete photos ────────────────────────────────────────
  const photos = {};
  await Promise.all(rankedAthletes.map(async (a) => {
    if (a.photoUrl) {
      try { photos[a.id] = await loadImg(a.photoUrl); } catch { /* fallback to initials */ }
    }
  }));

  // ── Preload season logo ───────────────────────────────────────────
  let logoImg = null;
  if (season.logoUrl) {
    try { logoImg = await loadImg(season.logoUrl); } catch { /* no logo */ }
  }

  // ── Last 5 check-in sessions (newest first) ───────────────────────
  const sortedSessions = [...allCheckins].sort((a, b) => b.date.localeCompare(a.date));
  const last5 = sortedSessions.slice(0, 5);
  // Display left-to-right: oldest first, newest last (highlighted)
  const displaySessions = [...last5].reverse();

  // ── Status style maps ─────────────────────────────────────────────
  const STATUS_BG = {
    [CheckinStatus.PRESENT]:    '#22c55e',
    [CheckinStatus.ABSENT]:     '#ef4444',
    [CalculatedStatus.EXTRA]:   '#eab308',
    [CalculatedStatus.ABSENCE]: '#ef4444',
    [CalculatedStatus.REST]:    '#3b82f6',
    [CheckinStatus.JUSTIFIED]:  '#8b5cf6',
    [CheckinStatus.HOSPITAL]:   '#f97316',
    [CheckinStatus.NOT_SET]:    'rgba(255,255,255,0.08)',
  };
  const STATUS_SYM = {
    [CheckinStatus.PRESENT]:    '✓',
    [CheckinStatus.ABSENT]:     '✗',
    [CalculatedStatus.EXTRA]:   '★',
    [CalculatedStatus.ABSENCE]: '✗',
    [CalculatedStatus.REST]:    '-',
    [CheckinStatus.JUSTIFIED]:  'J',
    [CheckinStatus.HOSPITAL]:   'H',
    [CheckinStatus.NOT_SET]:    '',
  };

  // ── Background ────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Header ────────────────────────────────────────────────────────
  const HMY     = HEADER_H / 2;
  const LOGO_R  = 48;
  const LOGO_CX = 24 + LOGO_R;

  if (logoImg) {
    clipCircle(LOGO_CX, HMY, LOGO_R, () => {
      ctx.drawImage(logoImg, LOGO_CX - LOGO_R, HMY - LOGO_R, LOGO_R * 2, LOGO_R * 2);
    });
    // Subtle white ring — no orange
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(LOGO_CX, HMY, LOGO_R, 0, Math.PI * 2); ctx.stroke();
  }

  const TX = logoImg ? LOGO_CX + LOGO_R + 20 : W / 2;
  const TA = logoImg ? 'left' : 'center';

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 34px Segoe UI';
  ctx.textAlign = TA;
  ctx.textBaseline = 'middle';
  ctx.fillText('CLASSIFICAÇÃO', TX, HMY - 22);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px Segoe UI';
  ctx.fillText(season.title || '', TX, HMY + 10);

  ctx.fillStyle = '#475569';
  ctx.font = '13px Segoe UI';
  const todayStr = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  ctx.fillText(todayStr, TX, HMY + 34);

  // ── Column header row ─────────────────────────────────────────────
  const COL_Y = HEADER_H;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, COL_Y, W, COL_HEADER_H);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, COL_Y);                ctx.lineTo(W, COL_Y);                ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, COL_Y + COL_HEADER_H); ctx.lineTo(W, COL_Y + COL_HEADER_H); ctx.stroke();

  const CMY = COL_Y + COL_HEADER_H / 2;
  ctx.font = 'bold 11px Segoe UI';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.fillText('#', POS_CX, CMY);

  ctx.textAlign = 'left';
  ctx.fillText('ATLETA', NAME_X, CMY);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#4ade80';
  ctx.fillText('✅', PRES_CX, CMY);
  ctx.fillStyle = '#f87171';
  ctx.fillText('❌', FALT_CX, CMY);
  ctx.fillStyle = '#60a5fa';
  ctx.fillText('🔷', DESC_CX, CMY);

  ctx.fillStyle = '#64748b';
  ctx.fillText('ÚLTIMOS 5', LAST5_HEADER_MX, CMY);

  // ── Athlete rows ──────────────────────────────────────────────────
  const ROWS_Y = COL_Y + COL_HEADER_H;
  const MEDAL = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const AVATAR_COLORS = [
    '#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316',
    '#06b6d4','#84cc16','#f59e0b','#6366f1','#ef4444',
  ];

  for (let i = 0; i < rankedAthletes.length; i++) {
    const athlete = rankedAthletes[i];
    const rowY = ROWS_Y + i * ROW_H;
    const midY = rowY + ROW_H / 2;

    // Alternating background
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0)';
    ctx.fillRect(0, rowY, W, ROW_H);

    // Top-3 highlight + left accent bar (medal color, no orange)
    if (i < 3) {
      ctx.fillStyle = `${MEDAL[i]}18`;
      ctx.fillRect(0, rowY, W, ROW_H);
      ctx.fillStyle = MEDAL[i];
      ctx.fillRect(0, rowY, 4, ROW_H);
    }

    // Row separator
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, rowY + ROW_H); ctx.lineTo(W, rowY + ROW_H); ctx.stroke();

    // Position badge
    const posR = 16;
    ctx.fillStyle = i < 3 ? MEDAL[i] : '#1e3a5f';
    ctx.beginPath(); ctx.arc(POS_CX, midY, posR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = i < 3 ? '#0f172a' : '#94a3b8';
    ctx.font = 'bold 13px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), POS_CX, midY + 1);

    // Photo — no ring/border on anyone
    const photoR = 22;
    if (photos[athlete.id]) {
      clipCircle(PHOTO_CX, midY, photoR, () => {
        ctx.drawImage(photos[athlete.id], PHOTO_CX - photoR, midY - photoR, photoR * 2, photoR * 2);
      });
    } else {
      drawInitials(athlete.name, PHOTO_CX, midY, photoR, AVATAR_COLORS[i % AVATAR_COLORS.length]);
    }

    // Athlete name
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 16px Segoe UI';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(abbreviateName(athlete.name), NAME_X, midY + 1, NAME_MAX);

    // Stats columns
    ctx.font = 'bold 18px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#4ade80';
    ctx.fillText(String(athlete.stats?.present ?? 0), PRES_CX, midY + 1);

    ctx.fillStyle = '#f87171';
    ctx.fillText(String(athlete.stats?.absence ?? 0), FALT_CX, midY + 1);

    ctx.fillStyle = '#60a5fa';
    ctx.fillText(String(athlete.stats?.rest ?? 0), DESC_CX, midY + 1);

    // Last-5 circles: j=0..3 small (oldest→recent), j=4 large (newest, highlighted)
    for (let j = 0; j < 5; j++) {
      const isNewest = (j === 4);
      const session  = displaySessions[j] || null;
      let status = CheckinStatus.NOT_SET;
      if (session) {
        status = session.athletes?.[athlete.id]?.status ?? CheckinStatus.NOT_SET;
      }

      const d  = isNewest ? LARGE_D : SMALL_D;
      const r  = d / 2;
      const cx = isNewest ? LARGE_CX : SMALL_CXS[j];

      // White highlight ring behind the newest circle
      if (isNewest && session) {
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, midY, r + 4, 0, Math.PI * 2); ctx.stroke();
      }

      ctx.fillStyle = STATUS_BG[status] ?? STATUS_BG[CheckinStatus.NOT_SET];
      ctx.beginPath(); ctx.arc(cx, midY, r, 0, Math.PI * 2); ctx.fill();

      const sym = STATUS_SYM[status];
      if (sym) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${isNewest ? 15 : 12}px Segoe UI`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sym, cx, midY + 1);
      }
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
};

/**
 * Compartilha imagem (API Web Share se disponível)
 */
export const shareWeeklyImage = async (blob, seasonTitle) => {
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], `${seasonTitle}.png`, { type: 'image/png' });
    
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `${seasonTitle} - Status Semanal`,
          text: 'Confira o status da semana!',
          files: [file]
        });
        return true;
      } catch (error) {
        console.log('Compartilhamento cancelado:', error);
        return false;
      }
    }
  }
  
  // Fallback: fazer download
  downloadWeeklyImage(blob, seasonTitle);
  return true;
};
