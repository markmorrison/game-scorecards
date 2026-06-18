import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../../shared/components/sc-button.js';
import { loadState, saveState } from '../../shared/storage.js';
import {
  createEmptyGame,
  leaderId,
  totalsFor,
  type UnoGameState,
} from './uno-types.js';

const STORAGE_KEY = 'uno-scorecard';

@customElement('uno-game')
export class UnoGame extends LitElement {
  static styles = css`
    :host {
      display: block;
      --game-accent: #e8222c;
      --game-accent-contrast: #ffffff;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-6);
    }

    .wordmark {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xl);
      font-weight: 800;
      font-style: italic;
    }

    .badge {
      display: inline-block;
      background: var(--game-accent);
      color: var(--game-accent-contrast);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-sm);
    }

    section {
      margin-bottom: var(--space-6);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-3);
    }

    .section-title {
      font-size: var(--font-size-sm);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-text-muted);
    }

    .players {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .player-chip {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius);
      border: var(--border-width) solid var(--color-border);
      background: var(--color-surface);
      min-width: 96px;
    }

    .player-chip.leader {
      border-color: var(--game-accent);
      border-width: 2px;
    }

    .player-name {
      font-size: var(--font-size-sm);
      display: flex;
      align-items: center;
      gap: var(--space-1);
      border: none;
      background: transparent;
      text-align: center;
      color: var(--color-text);
      font-family: inherit;
      width: 100%;
    }

    .player-total {
      font-size: var(--font-size-lg);
      font-weight: 700;
    }

    .player-total.leader {
      color: var(--game-accent);
    }

    .remove-player {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: var(--border-width) solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-text-muted);
      font-size: 12px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm);
    }

    th,
    td {
      padding: var(--space-2) var(--space-3);
      text-align: center;
      border-bottom: var(--border-width) solid var(--color-border);
    }

    th:first-child,
    td:first-child {
      text-align: left;
      color: var(--color-text-muted);
    }

    td.leader-cell {
      color: var(--game-accent);
      font-weight: 700;
    }

    .empty-rounds {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      padding: var(--space-3) 0;
    }

    .round-form {
      margin-top: var(--space-4);
      padding: var(--space-4);
      border-radius: var(--radius);
      border: var(--border-width) solid var(--color-border);
      background: var(--color-surface);
    }

    .round-form-grid {
      display: grid;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .round-form-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
    }

    .round-form-row label {
      font-size: var(--font-size-sm);
    }

    .round-form-row input {
      width: 96px;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
      border: var(--border-width) solid var(--color-border);
      font-size: var(--font-size-base);
      text-align: right;
    }

    .round-form-actions {
      display: flex;
      gap: var(--space-2);
    }

    .add-player-form {
      display: flex;
      gap: var(--space-2);
      align-items: center;
    }

    .add-player-form input {
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
      border: var(--border-width) solid var(--color-border);
      font-size: var(--font-size-sm);
      width: 140px;
    }

    .target-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--space-4);
      border-top: var(--border-width) solid var(--color-border);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }

    .target-row input {
      width: 80px;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      border: var(--border-width) solid var(--color-border);
      text-align: right;
      font-size: var(--font-size-sm);
    }

    .winner-banner {
      background: var(--game-accent);
      color: var(--game-accent-contrast);
      padding: var(--space-4);
      border-radius: var(--radius);
      margin-bottom: var(--space-6);
      font-weight: 700;
      text-align: center;
    }
  `;

  @state() private game: UnoGameState = createEmptyGame();
  @state() private addingRound = false;
  @state() private addingPlayer = false;
  @state() private roundDraft: Record<string, number> = {};
  @state() private newPlayerName = '';

  connectedCallback() {
    super.connectedCallback();
    const stored = loadState<UnoGameState>(STORAGE_KEY);
    if (stored) {
      this.game = stored;
    }
  }

  private persist() {
    saveState(STORAGE_KEY, this.game);
    this.requestUpdate();
  }

  private startNewGame() {
    if (
      this.game.rounds.length > 0 &&
      !confirm('Start a new game? This will clear the current scores.')
    ) {
      return;
    }
    this.game = createEmptyGame();
    this.persist();
  }

  private openAddPlayer() {
    this.addingPlayer = true;
    this.newPlayerName = '';
  }

  private confirmAddPlayer() {
    const name = this.newPlayerName.trim();
    if (!name) {
      this.addingPlayer = false;
      return;
    }
    this.game.players.push({ id: crypto.randomUUID(), name });
    this.addingPlayer = false;
    this.persist();
  }

  private removePlayer(id: string) {
    if (this.game.players.length <= 2) return;
    this.game.players = this.game.players.filter((p) => p.id !== id);
    for (const round of this.game.rounds) {
      delete round.scores[id];
    }
    this.persist();
  }

  private renamePlayer(id: string, name: string) {
    const player = this.game.players.find((p) => p.id === id);
    if (player) player.name = name;
    this.persist();
  }

  private openAddRound() {
    this.roundDraft = Object.fromEntries(
      this.game.players.map((p) => [p.id, 0])
    );
    this.addingRound = true;
  }

  private cancelAddRound() {
    this.addingRound = false;
  }

  private saveRound() {
    this.game.rounds.push({ scores: { ...this.roundDraft } });
    this.addingRound = false;
    this.persist();
  }

  private updateTargetScore(value: string) {
    const parsed = parseInt(value, 10);
    this.game.targetScore = Number.isFinite(parsed) ? parsed : 0;
    this.persist();
  }

  render() {
    const totals = totalsFor(this.game);
    const leader = leaderId(this.game);
    const winner = this.game.players.find(
      (p) => (totals[p.id] ?? 0) >= this.game.targetScore && leader === p.id
    );

    return html`
      <header>
        <span class="wordmark"><span class="badge">UNO</span> Scorecard</span>
        <sc-button variant="secondary" @click=${this.startNewGame}
          >New Game</sc-button
        >
      </header>

      ${winner
        ? html`<div class="winner-banner">
            🎉 ${winner.name} wins with ${totals[winner.id]} points!
          </div>`
        : nothing}

      <section>
        <div class="section-header">
          <span class="section-title">Players</span>
          ${!this.addingPlayer
            ? html`<sc-button variant="ghost" @click=${this.openAddPlayer}
                >+ Add Player</sc-button
              >`
            : nothing}
        </div>

        ${this.addingPlayer
          ? html`
              <div class="add-player-form">
                <input
                  type="text"
                  placeholder="Player name"
                  .value=${this.newPlayerName}
                  @input=${(e: InputEvent) =>
                    (this.newPlayerName = (
                      e.target as HTMLInputElement
                    ).value)}
                  @keydown=${(e: KeyboardEvent) => {
                    if (e.key === 'Enter') this.confirmAddPlayer();
                    if (e.key === 'Escape') (this.addingPlayer = false);
                  }}
                />
                <sc-button @click=${this.confirmAddPlayer}>Add</sc-button>
              </div>
            `
          : nothing}

        <div class="players" style="margin-top: var(--space-3)">
          ${this.game.players.map((player) => {
            const isLeader = player.id === leader;
            return html`
              <div class="player-chip ${isLeader ? 'leader' : ''}">
                ${this.game.players.length > 2
                  ? html`<button
                      class="remove-player"
                      title="Remove player"
                      @click=${() => this.removePlayer(player.id)}
                    >
                      ×
                    </button>`
                  : nothing}
                <input
                  class="player-name"
                  .value=${player.name}
                  @change=${(e: Event) =>
                    this.renamePlayer(
                      player.id,
                      (e.target as HTMLInputElement).value
                    )}
                />
                <span class="player-total ${isLeader ? 'leader' : ''}"
                  >${totals[player.id] ?? 0}</span
                >
              </div>
            `;
          })}
        </div>
      </section>

      <section>
        <div class="section-header">
          <span class="section-title">Rounds</span>
        </div>

        ${this.game.rounds.length === 0
          ? html`<p class="empty-rounds">No rounds yet. Add one below.</p>`
          : html`
              <table>
                <thead>
                  <tr>
                    <th>Round</th>
                    ${this.game.players.map(
                      (p) => html`<th>${p.name}</th>`
                    )}
                  </tr>
                </thead>
                <tbody>
                  ${this.game.rounds.map(
                    (round, i) => html`
                      <tr>
                        <td>${i + 1}</td>
                        ${this.game.players.map((p) => {
                          const score = round.scores[p.id] ?? 0;
                          const isLeader = p.id === leader;
                          return html`<td class=${isLeader ? 'leader-cell' : ''}>
                            ${score}
                          </td>`;
                        })}
                      </tr>
                    `
                  )}
                </tbody>
              </table>
            `}

        ${this.addingRound
          ? html`
              <div class="round-form">
                <div class="round-form-grid">
                  ${this.game.players.map(
                    (p) => html`
                      <div class="round-form-row">
                        <label for="round-${p.id}">${p.name}</label>
                        <input
                          id="round-${p.id}"
                          type="number"
                          inputmode="numeric"
                          .value=${String(this.roundDraft[p.id] ?? 0)}
                          @input=${(e: InputEvent) => {
                            const value = parseInt(
                              (e.target as HTMLInputElement).value,
                              10
                            );
                            this.roundDraft = {
                              ...this.roundDraft,
                              [p.id]: Number.isFinite(value) ? value : 0,
                            };
                          }}
                        />
                      </div>
                    `
                  )}
                </div>
                <div class="round-form-actions">
                  <sc-button @click=${this.saveRound}>Save Round</sc-button>
                  <sc-button variant="secondary" @click=${this.cancelAddRound}
                    >Cancel</sc-button
                  >
                </div>
              </div>
            `
          : html`
              <sc-button
                variant="secondary"
                style="margin-top: var(--space-3); width: 100%"
                @click=${this.openAddRound}
                >+ Add Round</sc-button
              >
            `}
      </section>

      <div class="target-row">
        <span>Target score</span>
        <input
          type="number"
          .value=${String(this.game.targetScore)}
          @change=${(e: Event) =>
            this.updateTargetScore((e.target as HTMLInputElement).value)}
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uno-game': UnoGame;
  }
}
