export const FPS = 30;

export const SCENE_DURATIONS = {
  loading: 90,      // 3s
  teaser: 900,      // ~20s
  opening: 180,     // 6s
  numbers: 220,     // 7s
  topPresentes: 210,// 7s
  hospital: 200,    // 7s
  descanso: 200,    // 7s 
  bonus: 220,       // 7s
  sumico: 210,      // 7s
  desistentes: 220, // 7s
  rankings: 240,    // 8s
  // titulos: dynamic (170f per athlete, min 150)
  rivalidade: 180,  // 6s
  financeiro: 150,  // 5s
  campeoes: 210,    // 7s
  caloteiro: 210,   // 7s
  encerramento: 250,// 8s
};

export function getTitulosDuration(numAthletes) {
  return Math.max(150, numAthletes * 170);
}

export function computeSceneOffsets(numAthletes) {
  const d = SCENE_DURATIONS;
  const titulosDur = getTitulosDuration(numAthletes);

  const offsets = {};
  let cursor = 0;

  const order = [
    ['loading', d.loading],
    ['teaser', d.teaser],
    ['opening', d.opening],
    ['numbers', d.numbers],
    ['topPresentes', d.topPresentes],
    ['hospital', d.hospital],
    ['descanso', d.descanso],
    ['bonus', d.bonus],
    ['sumico', d.sumico],
    ['desistentes', d.desistentes],
    ['rankings', d.rankings],
    ['titulos', titulosDur],
    ['rivalidade', d.rivalidade],
    ['financeiro', d.financeiro],
    ['campeoes', d.campeoes],
    ['caloteiro', d.caloteiro],
    ['encerramento', d.encerramento],
  ];

  for (const [name, dur] of order) {
    offsets[name] = { start: cursor, duration: dur };
    cursor += dur;
  }

  offsets.total = cursor;
  return offsets;
}
