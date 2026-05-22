import { calculateStats } from './calculator';
import { calculateAthleteXP, getAthleteRank } from '../services/checkins';
import {
  sortByRanking,
  sortByMostHospital,
  sortByMostRest,
  sortByMostExtra,
  sortByMostAbsence,
} from './ranking';
import { generateTitles } from './generateTitles';
import { differenceInDays, parseISO } from 'date-fns';

function calcMaxStreak(athleteId, sortedCheckins) {
  let max = 0;
  let current = 0;
  for (const c of sortedCheckins) {
    const s = c.athletes?.[athleteId]?.status;
    if (s === 'present' || s === 'extra') {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

function calcMaxGap(athleteId, sortedCheckins) {
  const dates = sortedCheckins
    .filter((c) => {
      const s = c.athletes?.[athleteId]?.status;
      return s === 'present' || s === 'extra';
    })
    .map((c) => c.date);

  if (dates.length < 2) return { days: 0, from: null, to: null };

  let maxDays = 0;
  let gapFrom = null;
  let gapTo = null;

  for (let i = 1; i < dates.length; i++) {
    const days = differenceInDays(parseISO(dates[i]), parseISO(dates[i - 1]));
    if (days > maxDays) {
      maxDays = days;
      gapFrom = dates[i - 1];
      gapTo = dates[i];
    }
  }

  return { days: maxDays, from: gapFrom, to: gapTo };
}

function findRivalry(rankedAthletes) {
  const active = rankedAthletes.filter((a) => !a.withdrawn);
  if (active.length < 2) return null;

  let minDiff = Infinity;
  let rivalA = null;
  let rivalB = null;

  for (let i = 0; i < active.length - 1; i++) {
    const diff = Math.abs(active[i].stats.present - active[i + 1].stats.present);
    if (diff < minDiff) {
      minDiff = diff;
      rivalA = active[i];
      rivalB = active[i + 1];
    }
  }

  return { athleteA: rivalA, athleteB: rivalB, difference: minDiff };
}

function getGrupoFrase(pct) {
  if (pct >= 80) return 'Grupo disciplinado. Respeito.';
  if (pct >= 60) return 'Deu pra chamar de grupo. Mais ou menos.';
  if (pct >= 40) return 'Academia ou ponto de encontro eventual?';
  return 'Participaram mais de espírito do que de corpo.';
}

function toDateObj(d) {
  if (!d) return null;
  if (d instanceof Date) return d;
  return parseISO(String(d).substring(0, 10));
}

function toDateStr(d) {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(String(d).substring(0, 10) + 'T00:00:00');
  if (isNaN(dt)) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function calcSeasonDays(season) {
  const start = toDateObj(season.startDate);
  const end = toDateObj(season.endDate);
  if (!start || !end || isNaN(start) || isNaN(end)) return 0;
  return differenceInDays(end, start) + 1;
}

export function calculateWrappedData(season, athletes, allCheckins, payments = []) {
  const sortedCheckins = [...allCheckins].sort((a, b) => a.date.localeCompare(b.date));

  const bonusBenefit = season.bonusBenefit || '-';
  const xpConfig = season.xpConfig || {};

  const athletesWithStats = athletes
    .filter((a) => season.participants?.includes(a.id))
    .map((athlete) => {
      const stats = calculateStats(sortedCheckins, athlete.id, bonusBenefit);
      const isChampion = season.champions?.first?.athleteId === athlete.id;
      const isRunnerUp = season.champions?.second?.athleteId === athlete.id;
      const championBonus = isChampion ? (xpConfig.championBonus ?? 30) : 0;
      const runnerUpBonus = isRunnerUp ? (xpConfig.runnerUpBonus ?? 15) : 0;
      const xp = calculateAthleteXP({ ...stats, championBonus, runnerUpBonus }, xpConfig);
      const rank = getAthleteRank(xp);
      const withdrawn = !!season.withdrawals?.[athlete.id];
      const maxStreak = calcMaxStreak(athlete.id, sortedCheckins);
      const { days: maxGap, from: gapFrom, to: gapTo } = calcMaxGap(athlete.id, sortedCheckins);

      return {
        id: athlete.id,
        name: athlete.name,
        photoUrl: athlete.photoUrl || null,
        stats,
        xp,
        rank,
        withdrawn,
        maxStreak,
        maxGap,
        gapFrom,
        gapTo,
      };
    });

  const totalDias = calcSeasonDays(season);
  const totalPresencas = athletesWithStats.reduce((s, a) => s + a.stats.present, 0);
  const totalFaltas = athletesWithStats.reduce((s, a) => s + a.stats.absence, 0);
  const totalHospital = athletesWithStats.reduce((s, a) => s + a.stats.hospital, 0);
  const totalExtra = athletesWithStats.reduce((s, a) => s + a.stats.extra, 0);
  const totalRest = athletesWithStats.reduce((s, a) => s + a.stats.rest, 0);
  const totalJustified = athletesWithStats.reduce((s, a) => s + a.stats.justified, 0);
  const totalAtletas = athletesWithStats.length;

  const maxPossivel = totalAtletas * totalDias;
  const presencaGeralPct = maxPossivel > 0 ? Math.round((totalPresencas / maxPossivel) * 100) : 0;

  const rankingPrincipal = sortByRanking(athletesWithStats);
  const rankingHospital = sortByMostHospital(athletesWithStats);
  const rankingFolgas = sortByMostRest(athletesWithStats);
  const rankingExtra = sortByMostExtra(athletesWithStats);
  const rankingFaltas = sortByMostAbsence(athletesWithStats);

  const byGap = [...athletesWithStats].sort((a, b) => b.maxGap - a.maxGap);
  const byStreak = [...athletesWithStats].sort((a, b) => b.maxStreak - a.maxStreak);

  const biggestDisappearance =
    byGap[0]?.maxGap > 0
      ? { athlete: byGap[0], days: byGap[0].maxGap, from: byGap[0].gapFrom, to: byGap[0].gapTo }
      : null;

  const bestStreak =
    byStreak[0]?.maxStreak > 0
      ? { athlete: byStreak[0], streak: byStreak[0].maxStreak }
      : null;

  const rivalry = findRivalry(rankingPrincipal);

  const titles = generateTitles(athletesWithStats, rankingPrincipal, season);

  let financialData = null;
  if (season.finePerAbsence > 0 && payments.length >= 0) {
    const paymentsByAthlete = {};
    payments.forEach((p) => {
      paymentsByAthlete[p.athleteId] = (paymentsByAthlete[p.athleteId] || 0) + p.value;
    });

    const athleteFinances = athletesWithStats.map((a) => {
      const totalPaid = paymentsByAthlete[a.id] || 0;
      const totalOwed = a.stats.absence * season.finePerAbsence;
      const debt = Math.max(0, totalOwed - totalPaid);
      return { ...a, totalPaid, totalOwed, debt };
    });

    const totalArrecadado = athleteFinances.reduce((s, a) => s + a.totalPaid, 0);
    const totalDevido = athleteFinances.reduce((s, a) => s + a.totalOwed, 0);
    const saldoDevedor = athleteFinances.reduce((s, a) => s + a.debt, 0);

    const maiorDevedor = [...athleteFinances].sort((a, b) => b.debt - a.debt)[0];
    const maisHonesto = athleteFinances.find((a) => a.debt === 0 && a.totalPaid > 0) || null;
    const devedores = [...athleteFinances]
      .filter((a) => a.debt > 0)
      .sort((a, b) => b.debt - a.debt)
      .map((a) => ({
        id: a.id,
        name: a.name,
        photoUrl: a.photoUrl || null,
        debt: a.debt,
        totalOwed: a.totalOwed,
        totalPaid: a.totalPaid,
        absences: a.stats.absence,
      }));

    financialData = {
      totalArrecadado,
      totalDevido,
      saldoDevedor,
      maiorDevedor: maiorDevedor?.debt > 0 ? { name: maiorDevedor.name, debt: maiorDevedor.debt } : null,
      maisHonesto: maisHonesto ? { name: maisHonesto.name, totalPaid: maisHonesto.totalPaid } : null,
      devedores,
    };
  }

  const withdrawals = Object.entries(season.withdrawals || {}).map(([athleteId, data]) => ({
    athleteId,
    athleteName: athletesWithStats.find((a) => a.id === athleteId)?.name || athleteId,
    date: data.date,
  }));

  const champions = {
    first: athletesWithStats.find((a) => a.id === season.champions?.first?.athleteId) || null,
    second: athletesWithStats.find((a) => a.id === season.champions?.second?.athleteId) || null,
  };

  return {
    season: {
      id: season.id,
      title: season.title,
      startDate: toDateStr(season.startDate),
      endDate: toDateStr(season.endDate),
      logoUrl: season.logoUrl || null,
      finePerAbsence: season.finePerAbsence || 0,
      bonusDates: season.bonusDates || [],
      champions: season.champions || {},
      withdrawals: season.withdrawals || {},
    },
    groupStats: {
      totalPresencas,
      totalFaltas,
      totalHospital,
      totalExtra,
      totalRest,
      totalJustified,
      totalAtletas,
      totalDias,
      presencaGeralPct,
      grupoFrase: getGrupoFrase(presencaGeralPct),
    },
    rankings: {
      principal: rankingPrincipal,
      hospital: rankingHospital,
      folgas: rankingFolgas,
      extra: rankingExtra,
      faltas: rankingFaltas,
    },
    athleteTimelines: athletesWithStats,
    biggestDisappearance,
    bestStreak,
    rivalry,
    titles,
    financialData,
    withdrawals,
    champions,
  };
}
