import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  deleteField
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'seasons';

export const DEFAULT_XP_CONFIG = {
  present: 3,
  absence: -2,
  rest: -1,
  justified: -1,
  hospital: -1,
  extra: 4,
  championBonus: 30,
  runnerUpBonus: 15
};

export const normalizeXPConfig = (xpConfig = {}) => {
  return {
    present: Number.isFinite(Number(xpConfig.present)) ? Number(xpConfig.present) : DEFAULT_XP_CONFIG.present,
    absence: Number.isFinite(Number(xpConfig.absence)) ? Number(xpConfig.absence) : DEFAULT_XP_CONFIG.absence,
    rest: Number.isFinite(Number(xpConfig.rest)) ? Number(xpConfig.rest) : DEFAULT_XP_CONFIG.rest,
    justified: Number.isFinite(Number(xpConfig.justified)) ? Number(xpConfig.justified) : DEFAULT_XP_CONFIG.justified,
    hospital: Number.isFinite(Number(xpConfig.hospital)) ? Number(xpConfig.hospital) : DEFAULT_XP_CONFIG.hospital,
    extra: Number.isFinite(Number(xpConfig.extra)) ? Number(xpConfig.extra) : DEFAULT_XP_CONFIG.extra,
    championBonus: Number.isFinite(Number(xpConfig.championBonus)) ? Number(xpConfig.championBonus) : DEFAULT_XP_CONFIG.championBonus,
    runnerUpBonus: Number.isFinite(Number(xpConfig.runnerUpBonus)) ? Number(xpConfig.runnerUpBonus) : DEFAULT_XP_CONFIG.runnerUpBonus
  };
};

const mapSeasonFromDoc = (seasonDoc) => {
  const data = seasonDoc.data();
  return {
    id: seasonDoc.id,
    ...data,
    startDate: data.startDate?.toDate(),
    endDate: data.endDate?.toDate(),
    xpConfig: normalizeXPConfig(data.xpConfig)
  };
};

/**
 * Converte string de data para Date object no timezone local
 */
const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Meio-dia local para evitar problemas de timezone
};

/**
 * Cria uma nova temporada
 */
export const createSeason = async (seasonData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...seasonData,
      startDate: parseLocalDate(seasonData.startDate),
      endDate: parseLocalDate(seasonData.endDate),
      xpConfig: normalizeXPConfig(seasonData.xpConfig),
      neutralDays: seasonData.neutralDays || [],
      createdAt: new Date(),
      active: true
    });
    return { id: docRef.id, ...seasonData };
  } catch (error) {
    console.error('Erro ao criar temporada:', error);
    throw error;
  }
};

/**
 * Comprime logo para Base64 via Canvas (max 200px, JPEG 85%)
 */
export const uploadSeasonLogo = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 200;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Busca todas as temporadas
 */
export const getAllSeasons = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('startDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapSeasonFromDoc);
  } catch (error) {
    console.error('Erro ao buscar temporadas:', error);
    throw error;
  }
};

/**
 * Busca a temporada ativa
 */
export const getActiveSeason = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('active', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Se houver múltiplas temporadas ativas, pega a mais recente
      const seasons = querySnapshot.docs.map(mapSeasonFromDoc);
      
      // Ordena manualmente por startDate
      seasons.sort((a, b) => b.startDate - a.startDate);
      return seasons[0];
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar temporada ativa:', error);
    throw error;
  }
};

/**
 * Busca uma temporada por ID
 */
export const getSeasonById = async (seasonId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, seasonId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return mapSeasonFromDoc(docSnap);
    } else {
      throw new Error('Temporada não encontrada');
    }
  } catch (error) {
    console.error('Erro ao buscar temporada:', error);
    throw error;
  }
};

/**
 * Atualiza uma temporada
 */
export const updateSeason = async (seasonId, updates) => {
  try {
    const seasonRef = doc(db, COLLECTION_NAME, seasonId);
    const updateData = { ...updates };
    
    if (updates.startDate) {
      updateData.startDate = parseLocalDate(updates.startDate);
    }
    if (updates.endDate) {
      updateData.endDate = parseLocalDate(updates.endDate);
    }
    if (updates.xpConfig) {
      updateData.xpConfig = normalizeXPConfig(updates.xpConfig);
    }
    
    await updateDoc(seasonRef, updateData);
    return { id: seasonId, ...updateData };
  } catch (error) {
    console.error('Erro ao atualizar temporada:', error);
    throw error;
  }
};

/**
 * Deleta uma temporada
 */
export const deleteSeason = async (seasonId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, seasonId));
  } catch (error) {
    console.error('Erro ao deletar temporada:', error);
    throw error;
  }
};

/**
 * Finaliza uma temporada (marca como inativa e salva campeões)
 */
export const finalizeSeason = async (seasonId, champions = null) => {
  try {
    const updates = { 
      active: false, 
      finalizedAt: new Date() 
    };
    
    if (champions) {
      updates.champions = champions;
    }
    
    await updateSeason(seasonId, updates);
  } catch (error) {
    console.error('Erro ao finalizar temporada:', error);
    throw error;
  }
};

/**
 * Busca títulos de um atleta (campeão ou vice) em temporadas finalizadas
 */
export const getAthleteTitles = async (athleteId) => {
  try {
    const allSeasons = await getAllSeasons();
    const titles = [];

    allSeasons.forEach(season => {
      if (!season.active && season.champions) {
        if (season.champions.first?.athleteId === athleteId) {
          titles.push({
            type: 'champion',
            seasonTitle: season.title,
            seasonId: season.id
          });
        } else if (season.champions.second?.athleteId === athleteId) {
          titles.push({
            type: 'runner-up',
            seasonTitle: season.title,
            seasonId: season.id
          });
        }
      }
    });

    return titles;
  } catch (error) {
    console.error('Erro ao buscar títulos do atleta:', error);
    return [];
  }
};

/**
 * Registra a desistência de um atleta na temporada
 * A partir da data informada, o atleta deixa de aparecer no check-in
 */
export const withdrawAthlete = async (seasonId, athleteId, withdrawalDate) => {
  try {
    const seasonRef = doc(db, COLLECTION_NAME, seasonId);
    await updateDoc(seasonRef, {
      [`withdrawals.${athleteId}`]: {
        date: withdrawalDate,
        registeredAt: new Date()
      }
    });
  } catch (error) {
    console.error('Erro ao registrar desistência:', error);
    throw error;
  }
};

/**
 * Desfaz a desistência de um atleta na temporada
 */
export const undoWithdrawal = async (seasonId, athleteId) => {
  try {
    const seasonRef = doc(db, COLLECTION_NAME, seasonId);
    await updateDoc(seasonRef, {
      [`withdrawals.${athleteId}`]: deleteField()
    });
  } catch (error) {
    console.error('Erro ao desfazer desistência:', error);
    throw error;
  }
};

/**
 * Recalcula e salva os campeões de uma temporada antiga que não tem essa informação
 * Útil para temporadas finalizadas antes da implementação dessa funcionalidade
 */
export const recalculateSeasonChampions = async (seasonId, checkinsData, athletes, seasonBonusBenefit) => {
  try {
    // Importar funções necessárias (note que isso precisa ser feito no componente)
    // Esta função será chamada do componente que já tem acesso a essas funções
    return { seasonId, checkinsData, athletes, seasonBonusBenefit };
  } catch (error) {
    console.error('Erro ao recalcular campeões:', error);
    throw error;
  }
};
