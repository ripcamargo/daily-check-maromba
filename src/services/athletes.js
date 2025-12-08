import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'athletes';

/**
 * Cria um novo atleta
 */
export const createAthlete = async (athleteData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...athleteData,
      history: [],
      createdAt: new Date()
    });
    return { id: docRef.id, ...athleteData };
  } catch (error) {
    console.error('Erro ao criar atleta:', error);
    throw error;
  }
};

/**
 * Converte foto para Base64 (sem usar Firebase Storage)
 */
export const uploadAthletePhoto = async (file, athleteId) => {
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
    console.error('Erro ao processar foto:', error);
    throw error;
  }
};

/**
 * Busca todos os atletas
 */
export const getAllAthletes = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar atletas:', error);
    throw error;
  }
};

/**
 * Busca um atleta por ID
 */
export const getAthleteById = async (athleteId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, athleteId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Atleta não encontrado');
    }
  } catch (error) {
    console.error('Erro ao buscar atleta:', error);
    throw error;
  }
};

/**
 * Atualiza os dados de um atleta
 */
export const updateAthlete = async (athleteId, updates) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, athleteId);
    await updateDoc(docRef, updates);
    return { id: athleteId, ...updates };
  } catch (error) {
    console.error('Erro ao atualizar atleta:', error);
    throw error;
  }
};

/**
 * Deleta um atleta
 */
export const deleteAthlete = async (athleteId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, athleteId));
  } catch (error) {
    console.error('Erro ao deletar atleta:', error);
    throw error;
  }
};

/**
 * Adiciona uma temporada ao histórico do atleta
 */
export const addSeasonToAthleteHistory = async (athleteId, seasonData) => {
  try {
    const athlete = await getAthleteById(athleteId);
    const updatedHistory = [...(athlete.history || []), seasonData];
    
    await updateAthlete(athleteId, { history: updatedHistory });
  } catch (error) {
    console.error('Erro ao adicionar temporada ao histórico:', error);
    throw error;
  }
};
