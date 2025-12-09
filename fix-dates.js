import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, setDoc, deleteDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para adicionar 1 dia a uma data no formato yyyy-MM-dd
const addOneDay = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + 1);
  
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newDay = String(date.getDate()).padStart(2, '0');
  
  return `${newYear}-${newMonth}-${newDay}`;
};

async function fixDates() {
  try {
    console.log('🚀 Iniciando correção de datas...\n');
    
    console.log('🔍 Buscando temporada ativa...');
    const seasonsQuery = query(collection(db, 'seasons'), where('active', '==', true));
    const seasonsSnapshot = await getDocs(seasonsQuery);
    
    if (seasonsSnapshot.empty) {
      console.error('❌ Nenhuma temporada ativa encontrada!');
      return;
    }

    const seasonDoc = seasonsSnapshot.docs[0];
    const season = { id: seasonDoc.id, ...seasonDoc.data() };
    console.log(`✅ Temporada: ${season.title}\n`);

    // Buscar todos os check-ins
    console.log('🔍 Carregando check-ins...');
    const checkinsRef = collection(db, 'seasons', season.id, 'checkins');
    const checkinsSnapshot = await getDocs(checkinsRef);
    
    const allCheckins = [];
    checkinsSnapshot.forEach(doc => {
      allCheckins.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ ${allCheckins.length} dias de check-in encontrados\n`);

    if (allCheckins.length === 0) {
      console.log('✅ Nenhum check-in para corrigir!');
      return;
    }

    console.log('📅 Corrigindo datas (+1 dia)...\n');

    let corrected = 0;
    const corrections = [];

    for (const checkin of allCheckins) {
      const oldDate = checkin.id; // O ID do documento é a data
      const newDate = addOneDay(oldDate);
      
      corrections.push({ oldDate, newDate, data: checkin });
      console.log(`  ${oldDate} → ${newDate}`);
    }

    console.log(`\n⚠️  Serão corrigidos ${corrections.length} registros.`);
    console.log('⚠️  Esta operação irá:');
    console.log('   1. Criar novos documentos com as datas corretas');
    console.log('   2. Deletar os documentos com datas incorretas');
    console.log('\n🔄 Aplicando correções...\n');

    for (const correction of corrections) {
      const { oldDate, newDate, data } = correction;
      
      // Criar novo documento com data corrigida
      const newDocRef = doc(db, 'seasons', season.id, 'checkins', newDate);
      await setDoc(newDocRef, {
        date: newDate,
        athletes: data.athletes,
        updatedAt: new Date()
      });
      
      // Deletar documento antigo
      const oldDocRef = doc(db, 'seasons', season.id, 'checkins', oldDate);
      await deleteDoc(oldDocRef);
      
      corrected++;
      console.log(`  ✓ ${oldDate} → ${newDate} (${corrected}/${corrections.length})`);
    }

    console.log(`\n✅ Correção concluída!`);
    console.log(`📝 ${corrected} registros corrigidos`);
    console.log('\n💡 Recarregue o Dashboard para ver as datas corretas!');
    console.log('\n✅ Script finalizado!');

  } catch (error) {
    console.error('❌ Erro ao corrigir datas:', error);
    process.exit(1);
  }
}

console.log('╔══════════════════════════════════════════════╗');
console.log('║   CORREÇÃO DE DATAS - Daily Check Maromba   ║');
console.log('╚══════════════════════════════════════════════╝\n');

fixDates().then(() => {
  console.log('\n👋 Encerrando...');
  process.exit(0);
});
