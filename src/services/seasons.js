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
  where
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'seasons';

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
 * Converte logo para Base64 (sem usar Firebase Storage)
 */
export const uploadSeasonLogo = async (file, seasonId) => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Retorna a imagem em Base64
        resolve(e.target.result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Erro ao processar logo:', error);
    throw error;
  }
};

/**
 * Busca todas as temporadas
 */
export const getAllSeasons = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('startDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate()
    }));
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
      const seasons = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate()
      }));
      
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
      return {
        id: docSnap.id,
        ...docSnap.data(),
        startDate: docSnap.data().startDate?.toDate(),
        endDate: docSnap.data().endDate?.toDate()
      };
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
 * Finaliza uma temporada (marca como inativa)
 */
export const finalizeSeason = async (seasonId) => {
  try {
    await updateSeason(seasonId, { active: false, finalizedAt: new Date() });
  } catch (error) {
    console.error('Erro ao finalizar temporada:', error);
    throw error;
  }
};
