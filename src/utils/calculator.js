import { format, eachDayOfInterval, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckinStatus, CalculatedStatus } from '../services/checkins';

/**
 * Calcula as estatísticas de um atleta baseado em seus check-ins
 * Aplica o benefício de vale-folga se configurado na temporada
 * @param {Array} checkins - Lista de check-ins
 * @param {string} athleteId - ID do atleta
 * @param {string} bonusBenefit - Benefício configurado na temporada ('vale-folga' ou '-')
 */
export const calculateStats = (checkins, athleteId, bonusBenefit = '-') => {
  const stats = {
    present: 0,
    rest: 0,
    absence: 0,
    hospital: 0,
    justified: 0,
    extra: 0,
    notSet: 0
  };

  checkins.forEach(checkin => {
    const athleteCheckin = checkin.athletes?.[athleteId];
    if (!athleteCheckin) return;

    const status = athleteCheckin.status;
    
    switch (status) {
      case CheckinStatus.PRESENT:
        stats.present++;
        break;
      case CalculatedStatus.REST:
        stats.rest++;
        break;
      case CalculatedStatus.ABSENCE:
        stats.absence++;
        break;
      case CheckinStatus.HOSPITAL:
        stats.hospital++;
        break;
      case CheckinStatus.JUSTIFIED:
        stats.justified++;
        break;
      case CalculatedStatus.EXTRA:
        stats.extra++;
        stats.present++; // EXTRA também conta como presença
        break;
      default:
        stats.notSet++;
    }
  });

  // Aplicar vale-folga: cada estrela anula uma falta
  if (bonusBenefit === 'vale-folga' && stats.extra > 0 && stats.absence > 0) {
    const valeFolgasUsed = Math.min(stats.extra, stats.absence);
    stats.absence -= valeFolgasUsed; // Reduz as faltas
    stats.rest += valeFolgasUsed; // Converte faltas em folgas
    // As estrelas não são consumidas, apenas aplicam o benefício
  }

  console.log(`Stats para atleta ${athleteId} (bonusBenefit: ${bonusBenefit}):`, stats);
  return stats;
};

/**
 * Calcula a multa de um atleta baseado em suas faltas
 * IMPORTANTE: Agora o sistema calcula automaticamente rest/absence
 * Contamos apenas as faltas (CalculatedStatus.ABSENCE) que já estão processadas
 */
export const calculateFine = (stats, finePerAbsence, weeklyRestLimit, checkins, neutralDays = []) => {
  // Remove dias neutros dos check-ins antes de calcular
  const validCheckins = checkins.filter(checkin => 
    !neutralDays.includes(checkin.date)
  );

  // A multa é baseada apenas nas faltas calculadas (absence)
  // O sistema já processou e determinou quais ausências são folgas vs faltas
  const totalAbsences = stats.absence;

  return {
    totalAbsences,
    excessRests: 0, // Não precisamos mais calcular isso manualmente
    fineAmount: Math.max(0, totalAbsences * finePerAbsence)
  };
};

/**
 * Agrupa check-ins por semana
 */
const groupByWeek = (checkins) => {
  const weeks = {};

  checkins.forEach(checkin => {
    const date = new Date(checkin.date);
    const weekStart = format(startOfWeek(date, { locale: ptBR }), 'yyyy-MM-dd');
    
    if (!weeks[weekStart]) {
      weeks[weekStart] = [];
    }
    weeks[weekStart].push(checkin);
  });

  return weeks;
};

/**
 * Calcula o total devido menos o total pago
 */
export const calculateDebt = (totalOwed, totalPaid) => {
  return Math.max(0, totalOwed - totalPaid);
};

/**
 * Gera todas as datas de uma temporada
 */
export const getSeasonDates = (startDate, endDate) => {
  try {
    return eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate)
    });
  } catch (error) {
    console.error('Erro ao gerar datas da temporada:', error);
    return [];
  }
};

/**
 * Verifica se uma data está dentro da temporada
 */
export const isDateInSeason = (date, season) => {
  return isWithinInterval(new Date(date), {
    start: new Date(season.startDate),
    end: new Date(season.endDate)
  });
};

/**
 * Verifica se uma data é um dia neutro
 */
export const isNeutralDay = (date, neutralDays = []) => {
  const dateStr = format(new Date(date), 'yyyy-MM-dd');
  return neutralDays.includes(dateStr);
};
