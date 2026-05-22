export function generateTitles(athletesWithStats, rankedAthletes, season) {
  const titles = {};

  const active = rankedAthletes.filter((a) => !a.withdrawn);
  const byHospital = [...athletesWithStats].sort((a, b) => b.stats.hospital - a.stats.hospital);
  const byRest = [...athletesWithStats].sort((a, b) => b.stats.rest - a.stats.rest);
  const byExtra = [...athletesWithStats].sort((a, b) => b.stats.extra - a.stats.extra);
  const byAbsence = [...athletesWithStats].sort((a, b) => b.stats.absence - a.stats.absence);
  const byGap = [...athletesWithStats].sort((a, b) => b.maxGap - a.maxGap);
  const byStreak = [...athletesWithStats].sort((a, b) => b.maxStreak - a.maxStreak);

  const assign = (athlete, title) => {
    if (athlete && !titles[athlete.id]) {
      titles[athlete.id] = title;
    }
  };

  // Campeões
  const champ = athletesWithStats.find((a) => a.id === season.champions?.first?.athleteId);
  const runner = athletesWithStats.find((a) => a.id === season.champions?.second?.athleteId);
  assign(champ, 'CAMPEÃO DA TEMPORADA');
  assign(runner, 'PRATA DA CASA');

  // Desistentes
  athletesWithStats.filter((a) => a.withdrawn).forEach((a) => assign(a, 'DESISTENTE CORAJOSO'));

  // Zero presenças
  const ghost = athletesWithStats.find((a) => a.stats.present === 0 && !a.withdrawn);
  assign(ghost, 'MITO NÃO CONFIRMADO');

  // Hospital top (mínimo 2)
  if (byHospital[0]?.stats.hospital >= 2) assign(byHospital[0], 'ATLETA DE RISCO');

  // Maior streak
  if (byStreak[0]?.maxStreak >= 10) assign(byStreak[0], 'DISCIPLINA IMORTAL');
  else if (byStreak[0]?.maxStreak >= 5) assign(byStreak[0], 'FERRO NA ROTINA');

  // Maior gap
  if (byGap[0]?.maxGap >= 21) assign(byGap[0], 'FANTASMA DA TEMPORADA');
  else if (byGap[0]?.maxGap >= 10) assign(byGap[0], 'ESPECIALISTA EM SUMIÇO');

  // Mais extras
  if (byExtra[0]?.stats.extra >= 3) assign(byExtra[0], 'CAÇADOR DE ESTRELA');

  // Mais folgas
  if (byRest[0]?.stats.rest >= 5) assign(byRest[0], 'MESTRE DO DESCANSO');

  // Mais faltas (entre os ativos)
  const worseActive = active[active.length - 1];
  if (worseActive && worseActive.stats.absence >= 5) assign(worseActive, 'CEO DO AGORA NÃO');

  // Último colocado sem título ainda
  const last = active[active.length - 1];
  assign(last, 'O FRANGUINHO OFICIAL');

  // Títulos padrão para quem não tem ainda
  const defaults = [
    'GUERREIRO DA CONSISTÊNCIA',
    'ATLETA EM DESENVOLVIMENTO',
    'FREQUENTADOR PROFISSIONAL',
    'SOBREVIVENTE DA TEMPORADA',
    'ENERGIA DE PROTAGONISTA',
    'LENDA SEM MARKETING',
  ];
  let defaultIdx = 0;

  for (const athlete of athletesWithStats) {
    if (!titles[athlete.id]) {
      const pos = active.findIndex((a) => a.id === athlete.id);
      if (pos === 0) {
        titles[athlete.id] = 'LENDA DA TEMPORADA';
      } else if (pos === 1) {
        titles[athlete.id] = 'VICE DA LENDA';
      } else {
        titles[athlete.id] = defaults[defaultIdx % defaults.length];
        defaultIdx++;
      }
    }
  }

  return athletesWithStats.map((a) => ({
    athleteId: a.id,
    athleteName: a.name,
    photoUrl: a.photoUrl,
    title: titles[a.id] || 'FREQUENTADOR PROFISSIONAL',
    stats: a.stats,
    xp: a.xp,
    rank: a.rank,
  }));
}
