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
  dealerId: string | null;
}

export function createEmptyGame(): UnoGameState {
  const players = [
    { id: crypto.randomUUID(), name: 'Player 1' },
    { id: crypto.randomUUID(), name: 'Player 2' },
  ];
  return {
    players,
    rounds: [],
    targetScore: 500,
    dealerId: players[0].id,
  };
}

/** Next dealer, cycling through players in their original (non-score-sorted) order. */
export function nextDealerId(game: UnoGameState): string | null {
  if (game.players.length === 0) return null;
  const currentIndex = game.players.findIndex((p) => p.id === game.dealerId);
  const nextIndex = (currentIndex + 1) % game.players.length;
  return game.players[nextIndex].id;
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

export interface Standing {
  player: UnoPlayer;
  total: number;
}

/** Lowest total score first — in this scorecard, the lowest score wins. */
export function standingsFor(game: UnoGameState): Standing[] {
  const totals = totalsFor(game);
  return [...game.players]
    .map((player) => ({ player, total: totals[player.id] ?? 0 }))
    .sort((a, b) => a.total - b.total);
}

/** The player with the lowest score once any player has reached the target. */
export function winnerFor(game: UnoGameState): UnoPlayer | null {
  if (game.rounds.length === 0) return null;
  const standings = standingsFor(game);
  const someoneReachedTarget = standings.some(
    (s) => s.total >= game.targetScore
  );
  return someoneReachedTarget ? standings[0].player : null;
}
