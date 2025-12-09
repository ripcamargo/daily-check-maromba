import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CheckinStatus = {
  NOT_SET: 'not_set',
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

async function fixAttendanceStatus() {
  try {
    console.log('🔧 Iniciando correção de status de presença...\n');

    // Buscar temporada
    const seasonsSnapshot = await getDocs(collection(db, 'seasons'));
    const season = seasonsSnapshot.docs[0].data();
    season.id = seasonsSnapshot.docs[0].id;
    
    console.log(`📅 Temporada: ${season.title}`);
    console.log(`   Limite de folgas: ${season.weeklyRestLimit}`);
    console.log(`   Datas bônus: ${season.bonusDates?.length || 0}\n`);

    // Buscar todos os check-ins ordenados por data
    const checkinsSnapshot = await getDocs(collection(db, 'checkins'));
    const allCheckins = checkinsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(c => c.seasonId === season.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log(`📝 Total de check-ins: ${allCheckins.length}\n`);

    let updatedCount = 0;

    // Processar cada check-in
    for (const checkin of allCheckins) {
      const isBonusDate = season.bonusDates?.includes(checkin.date) || false;
      const updates = {};
      let hasChanges = false;

      // Para cada atleta no check-in
      for (const [athleteId, athleteData] of Object.entries(checkin.athletes || {})) {
        const originalStatus = athleteData.originalStatus || athleteData.status;
        
        if (originalStatus === CheckinStatus.NOT_SET) continue;

        // Contar ausências ANTERIORES na mesma semana
        const weekCheckins = allCheckins.filter(c => {
          // Mesma semana e antes da data atual
          const checkinDate = new Date(c.date + 'T12:00:00');
          const currentDate = new Date(checkin.date + 'T12:00:00');
          
          // Calcular início da semana (segunda-feira)
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
          if (currentDate.getDay() === 0) weekStart.setDate(weekStart.getDate() - 7);
          
          const isInWeek = checkinDate >= weekStart && checkinDate < currentDate;
          return isInWeek && c.date < checkin.date;
        });

        // Contar ausências anteriores
        let absencesInWeek = 0;
        weekCheckins.forEach(wc => {
          const wAthleteData = wc.athletes?.[athleteId];
          if (wAthleteData) {
            const wStatus = wAthleteData.originalStatus || wAthleteData.status;
            if (wStatus === CheckinStatus.ABSENT) {
              absencesInWeek++;
            }
          }
        });

        // Se hoje é ausente, incrementa
        if (originalStatus === CheckinStatus.ABSENT) {
          absencesInWeek++;
        }

        // Calcular status correto
        const correctStatus = calculateFinalStatus(
          originalStatus,
          isBonusDate,
          absencesInWeek,
          season.weeklyRestLimit
        );

        // Verificar se precisa atualizar
        if (athleteData.status !== correctStatus) {
          updates[`athletes.${athleteId}.status`] = correctStatus;
          hasChanges = true;
          console.log(`✏️  ${checkin.date} - Atleta ${athleteId}: ${athleteData.status} → ${correctStatus} (${absencesInWeek} ausências)`);
        }
      }

      // Atualizar se houver mudanças
      if (hasChanges) {
        await updateDoc(doc(db, 'checkins', checkin.id), updates);
        updatedCount++;
      }
    }

    console.log(`\n✅ Correção concluída!`);
    console.log(`   Check-ins atualizados: ${updatedCount}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

fixAttendanceStatus();
