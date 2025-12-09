import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import pkg from 'date-fns/locale/pt-BR/index.js';
import dotenv from 'dotenv';
const { ptBR } = pkg;

dotenv.config();

// Configuração do Firebase
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

// Status
const CheckinStatus = {
  NOT_SET: '-',
  PRESENT: 'present',
  ABSENT: 'absent',
  HOSPITAL: 'hospital',
  JUSTIFIED: 'justified'
};

const CalculatedStatus = {
  REST: 'rest',
  ABSENCE: 'absence',
  EXTRA: 'extra'
};

// Mapeamento de status antigos para novos
const statusMigrationMap = {
  'present': 'present',
  'rest': 'absent',      // Folga antiga → Ausente (será recalculado)
  'absence': 'absent',   // Falta antiga → Ausente (será recalculado)
  'hospital': 'hospital',
  'justified': 'justified',
  'extra': 'present'     // Extra antigo → Presente (será recalculado se for data bônus)
};

const getWeekBounds = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return {
    start: startOfWeek(parsedDate, { weekStartsOn: 1, locale: ptBR }),
    end: endOfWeek(parsedDate, { weekStartsOn: 1, locale: ptBR })
  };
};

const calculateFinalStatus = (userStatus, isBonusDate, absencesInWeek, weeklyRestLimit) => {
  if (userStatus === CheckinStatus.PRESENT && isBonusDate) {
    return CalculatedStatus.EXTRA;
  }
  
  if (userStatus === CheckinStatus.PRESENT) {
    return CheckinStatus.PRESENT;
  }
  
  if (userStatus === CheckinStatus.HOSPITAL || userStatus === CheckinStatus.JUSTIFIED) {
    return userStatus;
  }
  
  if (userStatus === CheckinStatus.ABSENT) {
    return absencesInWeek <= weeklyRestLimit ? CalculatedStatus.REST : CalculatedStatus.ABSENCE;
  }
  
  return CheckinStatus.NOT_SET;
};

async function reprocessCheckins() {
  try {
    console.log('🔍 Buscando temporada ativa...');
    
    const seasonsQuery = query(collection(db, 'seasons'), where('active', '==', true));
    const seasonsSnapshot = await getDocs(seasonsQuery);
    
    if (seasonsSnapshot.empty) {
      console.error('❌ Nenhuma temporada ativa encontrada!');
      return;
    }

    const seasonDoc = seasonsSnapshot.docs[0];
    const season = { id: seasonDoc.id, ...seasonDoc.data() };
    console.log(`✅ Temporada: ${season.title}`);
    console.log(`   Limite de folgas semanais: ${season.weeklyRestLimit}`);
    console.log(`   Datas bônus: ${season.bonusDates?.length || 0}`);

    // Buscar todos os check-ins
    console.log('\n🔍 Carregando check-ins...');
    const checkinsRef = collection(db, 'seasons', season.id, 'checkins');
    const checkinsSnapshot = await getDocs(checkinsRef);
    
    const allCheckins = {};
    checkinsSnapshot.forEach(doc => {
      allCheckins[doc.id] = doc.data();
    });

    console.log(`✅ ${Object.keys(allCheckins).length} dias de check-in encontrados`);

    // Agrupar por semana
    const weeklyCheckins = {};
    Object.keys(allCheckins).forEach(date => {
      const { start } = getWeekBounds(date);
      const weekKey = format(start, 'yyyy-MM-dd');
      
      if (!weeklyCheckins[weekKey]) {
        weeklyCheckins[weekKey] = [];
      }
      weeklyCheckins[weekKey].push({ date, ...allCheckins[date] });
    });

    console.log(`\n📊 ${Object.keys(weeklyCheckins).length} semanas encontradas`);

    // Reprocessar semana por semana
    let totalUpdated = 0;
    const bonusDates = season.bonusDates || [];

    for (const [weekKey, weekDays] of Object.entries(weeklyCheckins)) {
      console.log(`\n📅 Semana de ${weekKey}:`);
      
      // Ordenar dias da semana
      weekDays.sort((a, b) => a.date.localeCompare(b.date));

      // Para cada atleta, contar ausências progressivamente
      const athleteAbsences = {};

      for (const dayData of weekDays) {
        const { date, athletes } = dayData;
        const isBonusDate = bonusDates.includes(date);
        const processedAthletes = {};

        for (const [athleteId, athleteData] of Object.entries(athletes || {})) {
          const oldStatus = athleteData.status;
          
          // Converter status antigo para novo formato
          const userStatus = statusMigrationMap[oldStatus] || oldStatus;
          
          // Inicializar contador de ausências do atleta
          if (!athleteAbsences[athleteId]) {
            athleteAbsences[athleteId] = 0;
          }

          // Se hoje é ausente, incrementa o contador ANTES de calcular
          let absencesIncludingToday = athleteAbsences[athleteId];
          if (userStatus === CheckinStatus.ABSENT) {
            absencesIncludingToday++;
          }

          // Calcular status final
          const finalStatus = calculateFinalStatus(
            userStatus,
            isBonusDate,
            absencesIncludingToday,
            season.weeklyRestLimit
          );

          // Atualizar contador para próximos dias se foi ausente
          if (userStatus === CheckinStatus.ABSENT) {
            athleteAbsences[athleteId] = absencesIncludingToday;
          }

          processedAthletes[athleteId] = {
            status: finalStatus,
            originalStatus: userStatus
          };

          if (oldStatus !== finalStatus) {
            console.log(`  ${date} - Atleta ${athleteId.substring(0, 8)}: ${oldStatus} → ${finalStatus}`);
          }
        }

        // Salvar dia reprocessado
        const docRef = doc(db, 'seasons', season.id, 'checkins', date);
        await setDoc(docRef, {
          date,
          athletes: processedAthletes,
          updatedAt: new Date()
        });

        totalUpdated++;
      }
    }

    console.log(`\n✅ Reprocessamento concluído!`);
    console.log(`📝 ${totalUpdated} dias atualizados`);
    console.log(`\n💡 Recarregue o Dashboard para ver os resultados!`);

  } catch (error) {
    console.error('❌ Erro durante reprocessamento:', error);
    throw error;
  }
}

console.log('🚀 Iniciando reprocessamento de check-ins...\n');
reprocessCheckins()
  .then(() => {
    console.log('\n✅ Script finalizado!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
