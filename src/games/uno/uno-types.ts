export interface UnoPlayer {
  id: string;
  name: string;
}

export interface UnoRound {
  scores: Record<string, number>;
}

export interface UnoGameState {
  players: UnoPlayer[];
  rounds: UnoRound[];
  targetScore: number;
}

export function createEmptyGame(): UnoGameState {
  return {
    players: [
      { id: crypto.randomUUID(), name: 'Player 1' },
      { id: crypto.randomUUID(), name: 'Player 2' },
    ],
    rounds: [],
    targetScore: 500,
  };
}

export function totalsFor(game: UnoGameState): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const player of game.players) {
    totals[player.id] = 0;
  }
  for (const round of game.rounds) {
    for (const [playerId, score] of Object.entries(round.scores)) {
      totals[playerId] = (totals[playerId] ?? 0) + score;
    }
  }
  return totals;
}

export function leaderId(game: UnoGameState): string | null {
  const totals = totalsFor(game);
  let leader: string | null = null;
  let max = -Infinity;
  for (const [playerId, total] of Object.entries(totals)) {
    if (total > max) {
      max = total;
      leader = playerId;
    }
  }
  return game.rounds.length > 0 ? leader : null;
}
