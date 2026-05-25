import { Composition, staticFile } from 'remotion';
import { GymWrapped } from './GymWrapped';
import { computeSceneOffsets, FPS } from './utils/sceneConfig';

const SAMPLE_DATA = {
  season: {
    title: 'Temporada Preview',
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    logoUrl: null,
    finePerAbsence: 5,
    bonusDates: [],
    champions: {},
    withdrawals: {},
  },
  groupStats: {
    totalPresencas: 247,
    totalFaltas: 42,
    totalHospital: 3,
    totalExtra: 18,
    totalRest: 89,
    totalJustified: 7,
    totalAtletas: 6,
    totalDias: 90,
    presencaGeralPct: 68,
    grupoFrase: 'Deu pra chamar de grupo. Mais ou menos.',
  },
  rankings: {
    principal: [
      { id: '1', name: 'Carlos', stats: { present: 55, absence: 3, rest: 10, hospital: 0, extra: 4, justified: 0 }, xp: 190, rank: { name: 'Braçudinho' }, withdrawn: false },
      { id: '2', name: 'Ana', stats: { present: 48, absence: 5, rest: 12, hospital: 1, extra: 2, justified: 0 }, xp: 160, rank: { name: 'Atleta' }, withdrawn: false },
      { id: '3', name: 'Pedro', stats: { present: 40, absence: 8, rest: 15, hospital: 0, extra: 3, justified: 1 }, xp: 130, rank: { name: 'Atleta' }, withdrawn: false },
      { id: '4', name: 'Mariana', stats: { present: 35, absence: 10, rest: 18, hospital: 1, extra: 5, justified: 2 }, xp: 100, rank: { name: 'Saudável' }, withdrawn: false },
      { id: '5', name: 'Lucas', stats: { present: 42, absence: 8, rest: 10, hospital: 1, extra: 4, justified: 0 }, xp: 140, rank: { name: 'Atleta' }, withdrawn: false },
      { id: '6', name: 'Fernanda', stats: { present: 27, absence: 8, rest: 24, hospital: 0, extra: 0, justified: 4 }, xp: 80, rank: { name: 'Saudável' }, withdrawn: false },
    ],
    hospital: [],
    folgas: [],
    extra: [],
    faltas: [],
  },
  athleteTimelines: [],
  biggestDisappearance: {
    athlete: { name: 'Lucas', photoUrl: null, stats: { present: 42, absence: 8 } },
    days: 18,
    from: '2025-03-10',
    to: '2025-03-28',
  },
  bestStreak: { athlete: { name: 'Carlos', photoUrl: null }, streak: 14 },
  rivalry: {
    athleteA: { name: 'Ana', stats: { present: 48 }, photoUrl: null },
    athleteB: { name: 'Pedro', stats: { present: 40 }, photoUrl: null },
    difference: 8,
  },
  titles: [
    { athleteId: '1', athleteName: 'Carlos', photoUrl: null, title: 'CAMPEÃO DA TEMPORADA', stats: { present: 55 }, xp: 190, rank: { name: 'Braçudinho' } },
    { athleteId: '2', athleteName: 'Ana', photoUrl: null, title: 'PRATA DA CASA', stats: { present: 48 }, xp: 160, rank: { name: 'Atleta' } },
    { athleteId: '3', athleteName: 'Pedro', photoUrl: null, title: 'FERRO NA ROTINA', stats: { present: 40 }, xp: 130, rank: { name: 'Atleta' } },
    { athleteId: '4', athleteName: 'Mariana', photoUrl: null, title: 'CAÇADORA DE ESTRELA', stats: { present: 35 }, xp: 100, rank: { name: 'Saudável' } },
    { athleteId: '5', athleteName: 'Lucas', photoUrl: null, title: 'ESPECIALISTA EM SUMIÇO', stats: { present: 42 }, xp: 140, rank: { name: 'Atleta' } },
    { athleteId: '6', athleteName: 'Fernanda', photoUrl: null, title: 'MESTRA DO DESCANSO', stats: { present: 27 }, xp: 80, rank: { name: 'Saudável' } },
  ],
  financialData: {
    totalArrecadado: 120,
    totalDevido: 210,
    saldoDevedor: 90,
    maiorDevedor: { name: 'Mariana', debt: 50 },
    maisHonesto: { name: 'Carlos', totalPaid: 15 },
  },
  withdrawals: [],
  champions: {
    first: { id: '1', name: 'Carlos', photoUrl: null, stats: { present: 55, absence: 3, rest: 10, hospital: 0, extra: 4, justified: 0 }, xp: 190, rank: { name: 'Braçudinho' } },
    second: { id: '2', name: 'Ana', photoUrl: null, stats: { present: 48, absence: 5, rest: 12, hospital: 1, extra: 2, justified: 0 }, xp: 160, rank: { name: 'Atleta' } },
    third: { id: '3', name: 'Pedro', photoUrl: null, stats: { present: 40, absence: 8, rest: 15, hospital: 0, extra: 3, justified: 1 }, xp: 130, rank: { name: 'Atleta' } },
  },
};

async function loadWrappedData() {
  try {
    const res = await fetch(staticFile('gym-wrapped-data.json'));
    if (!res.ok) throw new Error('not found');
    return await res.json();
  } catch {
    return SAMPLE_DATA;
  }
}

export const Root = () => {
  return (
    <Composition
      id="GymWrapped"
      component={GymWrapped}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={computeSceneOffsets(6).total}
      defaultProps={{ wrappedData: SAMPLE_DATA, offsets: computeSceneOffsets(6) }}
      calculateMetadata={async () => {
        const wrappedData = await loadWrappedData();
        const numAthletes = wrappedData?.titles?.length || 6;
        const offsets = computeSceneOffsets(numAthletes);
        return {
          durationInFrames: offsets.total,
          props: { wrappedData, offsets },
        };
      }}
    />
  );
};
