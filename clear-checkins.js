import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDe7l90JD5BCL58ip_L6kwAJdbNEKPMvi8",
  authDomain: "dailycheckmaromba.firebaseapp.com",
  projectId: "dailycheckmaromba",
  storageBucket: "dailycheckmaromba.firebasestorage.app",
  messagingSenderId: "906972202428",
  appId: "1:906972202428:web:c45c22edd40bb7e06208a7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearAllCheckins() {
  try {
    console.log('🚀 Iniciando limpeza de check-ins...\n');
    
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
      allCheckins.push(doc.id);
    });

    console.log(`✅ ${allCheckins.length} check-ins encontrados\n`);

    if (allCheckins.length === 0) {
      console.log('✅ Nenhum check-in para deletar!');
      return;
    }

    console.log('⚠️  ATENÇÃO: Todos os check-ins serão deletados!');
    console.log(`📅 Datas que serão removidas:\n`);
    allCheckins.forEach(date => {
      console.log(`  - ${date}`);
    });

    console.log(`\n🗑️  Deletando ${allCheckins.length} registros...\n`);

    let deleted = 0;
    for (const dateId of allCheckins) {
      const docRef = doc(db, 'seasons', season.id, 'checkins', dateId);
      await deleteDoc(docRef);
      deleted++;
      console.log(`  ✓ Deletado: ${dateId} (${deleted}/${allCheckins.length})`);
    }

    console.log(`\n✅ Limpeza concluída!`);
    console.log(`🗑️  ${deleted} check-ins deletados`);
    console.log('\n💡 Agora você pode inserir os dados novamente com as datas corretas!');
    console.log('✅ Script finalizado!');

  } catch (error) {
    console.error('❌ Erro ao limpar check-ins:', error);
    process.exit(1);
  }
}

console.log('╔══════════════════════════════════════════════╗');
console.log('║   LIMPEZA DE CHECK-INS - Daily Check        ║');
console.log('╚══════════════════════════════════════════════╝\n');

clearAllCheckins().then(() => {
  console.log('\n👋 Encerrando...');
  process.exit(0);
});
