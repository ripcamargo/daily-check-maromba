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

const MAX_PHOTO_PX = 400;
const PHOTO_QUALITY = 0.82;
const MAX_FULL_PHOTO_PX = 700;
const FULL_PHOTO_QUALITY = 0.8;

/**
 * Converte foto para Base64 comprimida via Canvas (max 400px, JPEG 82%)
 */
export const uploadAthletePhoto = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_PX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);

        resolve(canvas.toDataURL('image/jpeg', PHOTO_QUALITY));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Comprime foto de corpo completo para Base64 (max 700px, JPEG 80%)
 */
export const uploadFullPhoto = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, MAX_FULL_PHOTO_PX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', FULL_PHOTO_QUALITY));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
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
