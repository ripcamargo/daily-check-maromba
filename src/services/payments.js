import { 
  collection, 
  addDoc, 
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Registra um novo pagamento
 */
export const addPayment = async (seasonId, paymentData) => {
  try {
    // Mantém a data como string no formato yyyy-MM-dd para evitar problemas de timezone
    const dateStr = typeof paymentData.date === 'string' 
      ? paymentData.date 
      : paymentData.date.toISOString().split('T')[0];
    
    const docRef = await addDoc(
      collection(db, 'seasons', seasonId, 'payments'),
      {
        ...paymentData,
        date: dateStr,
        createdAt: new Date()
      }
    );
    
    return { id: docRef.id, ...paymentData, date: dateStr };
  } catch (error) {
    console.error('Erro ao adicionar pagamento:', error);
    throw error;
  }
};

/**
 * Busca todos os pagamentos de uma temporada
 */
export const getAllPayments = async (seasonId) => {
  try {
    const q = query(
      collection(db, 'seasons', seasonId, 'payments'),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Se a data já é string, mantém; se é Timestamp, converte para string
        date: typeof data.date === 'string' ? data.date : data.date?.toDate?.()
      };
    });
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    throw error;
  }
};

/**
 * Busca pagamentos de um atleta específico
 */
export const getPaymentsByAthlete = async (seasonId, athleteId) => {
  try {
    const q = query(
      collection(db, 'seasons', seasonId, 'payments'),
      where('athleteId', '==', athleteId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Se a data já é string, mantém; se é Timestamp, converte para string
        date: typeof data.date === 'string' ? data.date : data.date?.toDate?.()
      };
    });
  } catch (error) {
    console.error('Erro ao buscar pagamentos do atleta:', error);
    throw error;
  }
};

/**
 * Calcula o total pago por um atleta
 */
export const calculateTotalPaid = async (seasonId, athleteId) => {
  try {
    const payments = await getPaymentsByAthlete(seasonId, athleteId);
    return payments.reduce((total, payment) => total + payment.value, 0);
  } catch (error) {
    console.error('Erro ao calcular total pago:', error);
    throw error;
  }
};

/**
 * Calcula o total de pagamentos da temporada
 */
export const calculateSeasonTotal = async (seasonId) => {
  try {
    const payments = await getAllPayments(seasonId);
    return payments.reduce((total, payment) => total + payment.value, 0);
  } catch (error) {
    console.error('Erro ao calcular total da temporada:', error);
    throw error;
  }
};

/**
 * Exclui um pagamento
 */
export const deletePayment = async (seasonId, paymentId) => {
  try {
    await deleteDoc(doc(db, 'seasons', seasonId, 'payments', paymentId));
  } catch (error) {
    console.error('Erro ao excluir pagamento:', error);
    throw error;
  }
};
