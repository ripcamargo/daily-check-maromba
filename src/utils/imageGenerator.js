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
      canvas.height = 1480;
      const ctx = canvas.getContext('2d');

      // Carregar imagem de background
      const bgImage = new Image();
      bgImage.crossOrigin = 'anonymous';
      
      bgImage.onload = async () => {
        // Desenhar background
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        // Configurações de estilo
        const startX = 50;
        const startY = 250;
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
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        const title = `${format(weekStart, 'dd', { locale: ptBR })} a ${format(weekEnd, 'dd \'de\' MMMM', { locale: ptBR })}`;
        ctx.fillText(title, canvas.width / 2, 140);

        // Desenhar cabeçalho dos dias da semana
        ctx.font = 'bold 18px Arial';
        const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        daysOfWeek.forEach((day, index) => {
          const x = startX + 160 + (index * cellWidth) + (cellWidth / 2);
          ctx.fillText(day, x, startY - 10);
        });

        // Desenhar grid para cada atleta
        const sortedAthletes = [...athletes].sort((a, b) => a.name.localeCompare(b.name));
        
        sortedAthletes.forEach((athlete, athleteIndex) => {
          const y = startY + (athleteIndex * cellHeight);

          // Nome do atleta (abreviado)
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'left';
          ctx.fillStyle = '#ffffff';
          const abbreviatedName = abbreviateName(athlete.name);
          ctx.fillText(abbreviatedName, startX, y + 35);

          // Desenhar células dos dias
          weekDays.forEach((day, dayIndex) => {
            const x = startX + 160 + (dayIndex * cellWidth);
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
    [CheckinStatus.HOSPITAL]: '🏥',
    [CheckinStatus.JUSTIFIED]: '📄',
    [CalculatedStatus.REST]: '🛌',
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
