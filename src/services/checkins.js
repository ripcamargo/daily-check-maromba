import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Status possíveis de check-in (input do usuário)
 */
export const CheckinStatus = {
  NOT_SET: '-',
  PRESENT: 'present',
  ABSENT: 'absent',
  HOSPITAL: 'hospital',
  JUSTIFIED: 'justified'
};

/**
 * Status calculados automaticamente pelo sistema
 */
export const CalculatedStatus = {
  REST: 'rest',      // Ausência dentro do limite de folgas
  ABSENCE: 'absence', // Ausência acima do limite (falta)
  EXTRA: 'extra'      // Presença em data bônus
};

/**
 * Retorna o início e fim da semana para uma data
 * @param {string|Date} date - Data de referência
 * @param {number} weekStartsOn - Dia de início da semana (0=domingo, 1=segunda, etc)
 */
export const getWeekBounds = (date, weekStartsOn = 1) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return {
    start: startOfWeek(parsedDate, { weekStartsOn, locale: ptBR }),
    end: endOfWeek(parsedDate, { weekStartsOn, locale: ptBR })
  };
};

/**
 * Calcula o status final de um check-in baseado em regras
 * @param {string} userStatus - Status marcado pelo usuário
 * @param {boolean} isBonusDate - Se a data é bônus
 * @param {number} absencesInWeek - Número de ausências na semana (INCLUINDO o dia atual)
 * @param {number} weeklyRestLimit - Limite de folgas semanais
 */
export const calculateFinalStatus = (userStatus, isBonusDate, absencesInWeek, weeklyRestLimit) => {
  // Se presente em data bônus = EXTRA
  if (userStatus === CheckinStatus.PRESENT && isBonusDate) {
    return CalculatedStatus.EXTRA;
  }
  
  // Se presente normal = PRESENT
  if (userStatus === CheckinStatus.PRESENT) {
    return CheckinStatus.PRESENT;
  }
  
  // Hospital e Justificado mantém o status
  if (userStatus === CheckinStatus.HOSPITAL || userStatus === CheckinStatus.JUSTIFIED) {
    return userStatus;
  }
  
  // Se ausente, calcula se é folga ou falta
  // absencesInWeek já inclui a ausência de hoje
  if (userStatus === CheckinStatus.ABSENT) {
    return absencesInWeek <= weeklyRestLimit ? CalculatedStatus.REST : CalculatedStatus.ABSENCE;
  }
  
  return CheckinStatus.NOT_SET;
};

/**
 * Emojis para cada status
 */
export const StatusEmoji = {
  [CheckinStatus.NOT_SET]: '-',
  [CheckinStatus.PRESENT]: '✅',
  [CheckinStatus.ABSENT]: '▢',
  [CheckinStatus.HOSPITAL]: '🚑',
  [CheckinStatus.JUSTIFIED]: '📄',
  [CalculatedStatus.REST]: '🔷',
  [CalculatedStatus.ABSENCE]: '❌',
  [CalculatedStatus.EXTRA]: '⭐'
};

/**
 * Cores para cada status
 */
export const StatusColor = {
  [CheckinStatus.NOT_SET]: '#9ca3af',
  [CheckinStatus.PRESENT]: '#10b981',
  [CheckinStatus.ABSENT]: '#3b82f6',
  [CheckinStatus.HOSPITAL]: '#f59e0b',
  [CheckinStatus.JUSTIFIED]: '#6366f1',
  [CalculatedStatus.REST]: '#3b82f6',
  [CalculatedStatus.ABSENCE]: '#ef4444',
  [CalculatedStatus.EXTRA]: '#eab308'
};

/**
 * Busca todos os check-ins de uma semana
 * @param {string} seasonId - ID da temporada
 * @param {string|Date} date - Data de referência
 * @param {number} weekStartsOn - Dia de início da semana (0=domingo, 1=segunda, etc)
 */
export const getWeekCheckins = async (seasonId, date, weekStartsOn = 1) => {
  try {
    const { start, end } = getWeekBounds(date, weekStartsOn);
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');
    
    const allCheckins = await getAllCheckins(seasonId);
    return allCheckins.filter(checkin => 
      checkin.date >= startStr && checkin.date <= endStr
    );
  } catch (error) {
    console.error('Erro ao buscar check-ins da semana:', error);
    throw error;
  }
};

/**
 * Conta ausências de um atleta na semana
 */
export const countWeeklyAbsences = (weekCheckins, athleteId) => {
  let absenceCount = 0;
  
  weekCheckins.forEach(checkin => {
    const athleteData = checkin.athletes?.[athleteId];
    if (!athleteData) return;
    
    // Conta o status ORIGINAL (antes do processamento)
    // Se existe originalStatus, usa ele; senão, usa o status atual
    const originalStatus = athleteData.originalStatus || athleteData.status;
    
    // Conta apenas ausências diretas (não hospital, não justificado)
    if (originalStatus === CheckinStatus.ABSENT) {
      absenceCount++;
    }
  });
  
  return absenceCount;
};

/**
 * Processa check-ins aplicando regras automáticas
 * @param {Object} season - Dados da temporada
 * @param {string} date - Data dos check-ins
 * @param {Object} rawCheckins - Check-ins marcados pelo usuário
 */
export const processCheckins = async (season, date, rawCheckins) => {
  try {
    const weekStartsOn = season.weekStartsOn ?? 1; // Default segunda-feira
    const weekCheckins = await getWeekCheckins(season.id, date, weekStartsOn);
    const bonusDates = season.bonusDates || [];
    const isBonusDate = bonusDates.includes(date);
    const processedCheckins = {};
    
    // Para cada atleta
    for (const [athleteId, checkinData] of Object.entries(rawCheckins)) {
      const userStatus = checkinData.status;
      
      // Pula se não foi marcado
      if (userStatus === CheckinStatus.NOT_SET) {
        processedCheckins[athleteId] = { status: CheckinStatus.NOT_SET };
        continue;
      }
      
      // Conta ausências do atleta na semana (excluindo a data atual e datas futuras)
      const weekCheckinsExcludingToday = weekCheckins.filter(c => c.date !== date && c.date < date);
      let absencesInWeek = countWeeklyAbsences(weekCheckinsExcludingToday, athleteId);
      
      // Se hoje é ausente, incrementa o contador ANTES de calcular
      if (userStatus === CheckinStatus.ABSENT) {
        absencesInWeek++;
      }
      
      // Calcula status final
      const finalStatus = calculateFinalStatus(
        userStatus,
        isBonusDate,
        absencesInWeek,
        season.weeklyRestLimit
      );
      
      processedCheckins[athleteId] = { 
        status: finalStatus,
        originalStatus: userStatus // Mantém o status original para edição
      };
    }
    
    return processedCheckins;
  } catch (error) {
    console.error('Erro ao processar check-ins:', error);
    throw error;
  }
};

/**
 * Salva ou atualiza check-ins de um dia específico
 */
export const saveCheckins = async (seasonId, date, checkinsData, season) => {
  try {
    // Se date já é string no formato correto, usar diretamente
    const dateStr = typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/) 
      ? date 
      : format(new Date(date), 'yyyy-MM-dd');
    
    console.log('Salvando check-ins para:', dateStr);
    console.log('Data original recebida:', date, typeof date);
    console.log('Dados recebidos:', checkinsData);
    
    // Processa check-ins com regras automáticas
    const processedCheckins = await processCheckins(season, dateStr, checkinsData);
    
    console.log('Dados processados:', processedCheckins);
    
    const docRef = doc(db, 'seasons', seasonId, 'checkins', dateStr);
    
    // Sobrescreve completamente o documento
    await setDoc(docRef, {
      date: dateStr,
      athletes: processedCheckins,
      updatedAt: new Date()
    }, { merge: false }); // Explicitamente não fazer merge
    
    console.log('Check-ins salvos com sucesso!');
    
    return { date: dateStr, athletes: processedCheckins };
  } catch (error) {
    console.error('Erro ao salvar check-ins:', error);
    throw error;
  }
};

/**
 * Busca check-ins de uma data específica
 */
export const getCheckinsByDate = async (seasonId, date) => {
  try {
    // Se date já é string no formato correto, usar diretamente
    const dateStr = typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/) 
      ? date 
      : format(new Date(date), 'yyyy-MM-dd');
    const docRef = doc(db, 'seasons', seasonId, 'checkins', dateStr);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar check-ins:', error);
    throw error;
  }
};

/**
 * Busca todos os check-ins de uma temporada
 */
export const getAllCheckins = async (seasonId) => {
  try {
    const q = query(
      collection(db, 'seasons', seasonId, 'checkins'),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Erro ao buscar todos check-ins:', error);
    throw error;
  }
};

/**
 * Calcula estatísticas de check-in de um atleta em uma temporada
 */
export const calculateAthleteStats = async (seasonId, athleteId) => {
  try {
    const allCheckins = await getAllCheckins(seasonId);
    
    const stats = {
      present: 0,
      rest: 0,
      absence: 0,
      hospital: 0,
      justified: 0,
      extra: 0,
      notSet: 0
    };
    
    allCheckins.forEach(checkin => {
      const athleteStatus = checkin.athletes?.[athleteId];
      if (athleteStatus) {
        switch (athleteStatus.status) {
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
            break;
          default:
            stats.notSet++;
        }
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    throw error;
  }
};

/**
 * Atualiza o status de check-in de um atleta em uma data específica
 */
export const updateAthleteCheckin = async (seasonId, date, athleteId, status) => {
  try {
    const dateStr = format(new Date(date), 'yyyy-MM-dd');
    const docRef = doc(db, 'seasons', seasonId, 'checkins', dateStr);
    const docSnap = await getDoc(docRef);
    
    let checkinsData = { athletes: {} };
    
    if (docSnap.exists()) {
      checkinsData = docSnap.data();
    }
    
    checkinsData.athletes[athleteId] = { status };
    
    await setDoc(docRef, {
      date: dateStr,
      athletes: checkinsData.athletes,
      updatedAt: new Date()
    });
    
    return checkinsData;
  } catch (error) {
    console.error('Erro ao atualizar check-in do atleta:', error);
    throw error;
  }
};
