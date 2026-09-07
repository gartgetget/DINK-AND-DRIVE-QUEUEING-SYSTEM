import { Player, SkillTier } from '../types';

export interface MatchBalanceResult {
  teamA: Player[];
  teamB: Player[];
  avgA: number;
  avgB: number;
  diff: number;
  fairnessScore: number; // 0 - 100%
  tier: SkillTier;
  balanceComment: string;
}

/**
 * Given 4 players for doubles, calculates all permutations and returns the pairing
 * that yields the closest team average Meter ratings for maximum game balance.
 */
export function optimizeDoublesTeams(players: Player[]): MatchBalanceResult | null {
  if (players.length < 4) return null;
  const p = players.slice(0, 4);

  // Permutation 1: (p0, p1) vs (p2, p3)
  // Permutation 2: (p0, p2) vs (p1, p3)
  // Permutation 3: (p0, p3) vs (p1, p2)
  const pairings = [
    { teamA: [p[0], p[1]], teamB: [p[2], p[3]] },
    { teamA: [p[0], p[2]], teamB: [p[1], p[3]] },
    { teamA: [p[0], p[3]], teamB: [p[1], p[2]] },
  ];

  let bestPairing = pairings[0];
  let minDiff = Infinity;

  for (const pair of pairings) {
    const avgA = (pair.teamA[0].duprRating + pair.teamA[1].duprRating) / 2;
    const avgB = (pair.teamB[0].duprRating + pair.teamB[1].duprRating) / 2;
    const diff = Math.abs(avgA - avgB);

    if (diff < minDiff) {
      minDiff = diff;
      bestPairing = pair;
    }
  }

  const finalAvgA = Number(((bestPairing.teamA[0].duprRating + bestPairing.teamA[1].duprRating) / 2).toFixed(2));
  const finalAvgB = Number(((bestPairing.teamB[0].duprRating + bestPairing.teamB[1].duprRating) / 2).toFixed(2));
  const finalDiff = Number(Math.abs(finalAvgA - finalAvgB).toFixed(2));

  // Compute fairness: 100% at 0 diff, drops as diff increases (diff of 0.5 is ~75%, 1.0 is ~50%)
  const fairnessScore = Math.max(30, Math.min(100, Math.round(100 - (finalDiff * 45))));

  const overallAvg = (finalAvgA + finalAvgB) / 2;
  let tier: SkillTier = 'Intermediate (3.0-3.9)';
  if (overallAvg < 3.0) tier = 'Novice (2.0-2.9)';
  else if (overallAvg >= 5.0) tier = 'Elite (5.0+)';
  else if (overallAvg >= 4.0) tier = 'Advanced (4.0-4.9)';

  let comment = 'Extremely balanced match. High rally potential.';
  if (finalDiff > 0.35) {
    comment = 'Moderate rating variance. Players can utilize stacking strategy.';
  } else if (finalDiff > 0.6) {
    comment = 'Wide rating spread. Great for mentor-style play.';
  }

  return {
    teamA: bestPairing.teamA,
    teamB: bestPairing.teamB,
    avgA: finalAvgA,
    avgB: finalAvgB,
    diff: finalDiff,
    fairnessScore,
    tier,
    balanceComment: comment,
  };
}

/**
 * Generates optimal singles matchup
 */
export function optimizeSinglesMatch(playerA: Player, playerB: Player): MatchBalanceResult {
  const ratingA = playerA.singlesDupr ?? playerA.duprRating;
  const ratingB = playerB.singlesDupr ?? playerB.duprRating;
  const diff = Number(Math.abs(ratingA - ratingB).toFixed(2));
  const fairnessScore = Math.max(25, Math.min(100, Math.round(100 - (diff * 50))));

  const avg = (ratingA + ratingB) / 2;
  let tier: SkillTier = 'Intermediate (3.0-3.9)';
  if (avg < 3.0) tier = 'Novice (2.0-2.9)';
  else if (avg >= 5.0) tier = 'Elite (5.0+)';
  else if (avg >= 4.0) tier = 'Advanced (4.0-4.9)';

  return {
    teamA: [playerA],
    teamB: [playerB],
    avgA: ratingA,
    avgB: ratingB,
    diff,
    fairnessScore,
    tier,
    balanceComment: diff <= 0.25 ? 'Ideal heads-up singles pairing' : 'Challenger singles matchup',
  };
}

/**
 * Filter players matching a skill tier or Meter range
 */
export function getPlayersInTier(players: Player[], tier: SkillTier): Player[] {
  if (tier === 'All Levels') return players;
  if (tier === 'Novice (2.0-2.9)') return players.filter(p => p.duprRating >= 2.0 && p.duprRating < 3.0);
  if (tier === 'Intermediate (3.0-3.9)') return players.filter(p => p.duprRating >= 3.0 && p.duprRating < 4.0);
  if (tier === 'Advanced (4.0-4.9)') return players.filter(p => p.duprRating >= 4.0 && p.duprRating < 5.0);
  return players.filter(p => p.duprRating >= 5.0);
}
