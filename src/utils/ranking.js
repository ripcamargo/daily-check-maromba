/**
 * Ordena atletas por ranking seguindo os critérios de desempate
 */
export const sortByRanking = (athletes) => {
  return [...athletes].sort((a, b) => {
    // 1. Maior número de presenças
    if (b.stats.present !== a.stats.present) {
      return b.stats.present - a.stats.present;
    }

    // 2. Menor número de faltas
    if (a.stats.absence !== b.stats.absence) {
      return a.stats.absence - b.stats.absence;
    }

    // 3. Menor número de folgas
    if (a.stats.rest !== b.stats.rest) {
      return a.stats.rest - b.stats.rest;
    }

    // 4. Menor número de ausências justificadas
    if (a.stats.justified !== b.stats.justified) {
      return a.stats.justified - b.stats.justified;
    }

    // 5. Menor número de idas ao hospital
    if (a.stats.hospital !== b.stats.hospital) {
      return a.stats.hospital - b.stats.hospital;
    }

    // Empate total
    return 0;
  });
};

/**
 * Cria ranking de quem descansou mais
 */
export const sortByMostRest = (athletes) => {
  return [...athletes].sort((a, b) => b.stats.rest - a.stats.rest);
};

/**
 * Cria ranking de quem faltou mais
 */
export const sortByMostAbsence = (athletes) => {
  return [...athletes].sort((a, b) => b.stats.absence - a.stats.absence);
};

/**
 * Cria ranking de quem foi mais ao hospital
 */
export const sortByMostHospital = (athletes) => {
  return [...athletes].sort((a, b) => b.stats.hospital - a.stats.hospital);
};

/**
 * Cria ranking de quem fez mais extras
 */
export const sortByMostExtra = (athletes) => {
  return [...athletes].sort((a, b) => b.stats.extra - a.stats.extra);
};

/**
 * Calcula a posição de um atleta no ranking principal
 */
export const getAthletePosition = (athleteId, athletes) => {
  const sorted = sortByRanking(athletes);
  return sorted.findIndex(athlete => athlete.id === athleteId) + 1;
};

/**
 * Calcula pontuação total de um atleta (para sistemas de pontos futuros)
 */
export const calculateTotalPoints = (stats) => {
  const points = {
    present: 10,
    extra: 15,
    rest: 0,
    absence: -5,
    hospital: 0,
    justified: 0
  };

  return (
    stats.present * points.present +
    stats.extra * points.extra +
    stats.rest * points.rest +
    stats.absence * points.absence +
    stats.hospital * points.hospital +
    stats.justified * points.justified
  );
};

/**
 * Determina o nível de desempenho de um atleta
 */
export const getPerformanceLevel = (stats, totalDays) => {
  const attendanceRate = (stats.present / totalDays) * 100;

  if (attendanceRate >= 90) return { level: 'Excelente', color: '#10b981' };
  if (attendanceRate >= 75) return { level: 'Muito Bom', color: '#3b82f6' };
  if (attendanceRate >= 60) return { level: 'Bom', color: '#f59e0b' };
  if (attendanceRate >= 50) return { level: 'Regular', color: '#ef4444' };
  return { level: 'Precisa Melhorar', color: '#991b1b' };
};

/**
 * Calcula a taxa de presença de um atleta
 */
export const calculateAttendanceRate = (stats, totalDays) => {
  if (totalDays === 0) return 0;
  return ((stats.present / totalDays) * 100).toFixed(1);
};
