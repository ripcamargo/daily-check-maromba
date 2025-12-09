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

// Função para subtrair 1 dia de uma data no formato yyyy-MM-dd
const subtractOneDay = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newDay = String(date.getDate()).padStart(2, '0');
  
  return `${newYear}-${newMonth}-${newDay}`;
};

async function revertDates() {
  try {
    console.log('🚀 Iniciando reversão de datas...\n');
    
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
      console.log('✅ Nenhum check-in para reverter!');
      return;
    }

    console.log('📅 Revertendo datas (-1 dia)...\n');

    let reverted = 0;
    const reversions = [];

    for (const checkin of allCheckins) {
      const currentDate = checkin.id; // O ID do documento é a data
      const previousDate = subtractOneDay(currentDate);
      
      reversions.push({ currentDate, previousDate, data: checkin });
      console.log(`  ${currentDate} → ${previousDate}`);
    }

    console.log(`\n⚠️  Serão revertidos ${reversions.length} registros.`);
    console.log('⚠️  Esta operação irá:');
    console.log('   1. Criar novos documentos com as datas revertidas');
    console.log('   2. Deletar os documentos atuais');
    console.log('\n🔄 Aplicando reversões...\n');

    for (const reversion of reversions) {
      const { currentDate, previousDate, data } = reversion;
      
      // Criar novo documento com data revertida
      const newDocRef = doc(db, 'seasons', season.id, 'checkins', previousDate);
      await setDoc(newDocRef, {
        date: previousDate,
        athletes: data.athletes,
        updatedAt: new Date()
      });
      
      // Deletar documento atual
      const oldDocRef = doc(db, 'seasons', season.id, 'checkins', currentDate);
      await deleteDoc(oldDocRef);
      
      reverted++;
      console.log(`  ✓ ${currentDate} → ${previousDate} (${reverted}/${reversions.length})`);
    }

    console.log(`\n✅ Reversão concluída!`);
    console.log(`📝 ${reverted} registros revertidos`);
    console.log('\n💡 Recarregue o Dashboard para ver as datas restauradas!');
    console.log('\n✅ Script finalizado!');

  } catch (error) {
    console.error('❌ Erro ao reverter datas:', error);
    process.exit(1);
  }
}

console.log('╔══════════════════════════════════════════════╗');
console.log('║   REVERSÃO DE DATAS - Daily Check Maromba   ║');
console.log('╚══════════════════════════════════════════════╝\n');

revertDates().then(() => {
  console.log('\n👋 Encerrando...');
  process.exit(0);
});
