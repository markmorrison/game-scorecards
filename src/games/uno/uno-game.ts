import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import '../../shared/components/sc-button.js';
import { formFieldStyles } from '../../shared/styles/form-field.styles.js';
import { loadState, saveState } from '../../shared/storage.js';
import styles from './uno-game.css?inline';
import {
  createEmptyGame,
  nextDealerId,
  standingsFor,
  winnerFor,
  type UnoGameState,
} from './uno-types.js';

const STORAGE_KEY = 'uno-scorecard';

@customElement('uno-game')
export class UnoGame extends LitElement {
  static styles = [formFieldStyles, unsafeCSS(styles)];

  @state() private game: UnoGameState = createEmptyGame();
  @state() private roundDraft: Record<string, number> = {};
  @state() private editingRoundIndex: number | null = null;

  @query('#round-dialog') private roundDialog!: HTMLDialogElement;
  @query('#settings-dialog') private settingsDialog!: HTMLDialogElement;

  connectedCallback() {
    super.connectedCallback();
    const stored = loadState<UnoGameState>(STORAGE_KEY);
    if (stored) {
      this.game = {
        ...stored,
        dealerId: stored.dealerId ?? stored.players[0]?.id ?? null,
      };
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

  private addPlayer() {
    const id = crypto.randomUUID();
    this.game.players.push({
      id,
      name: `Player ${this.game.players.length + 1}`,
    });
    this.persist();
    this.updateComplete.then(() => {
      const input = this.renderRoot.querySelector<HTMLInputElement>(
        `input[data-player-id="${id}"]`
      );
      input?.focus();
      input?.select();
    });
  }

  private removePlayer(id: string) {
    if (this.game.players.length <= 2) return;
    this.game.players = this.game.players.filter((p) => p.id !== id);
    for (const round of this.game.rounds) {
      delete round.scores[id];
    }
    if (this.game.dealerId === id) {
      this.game.dealerId = this.game.players[0].id;
    }
    this.persist();
  }

  private renamePlayer(id: string, name: string) {
    const player = this.game.players.find((p) => p.id === id);
    if (player) player.name = name;
    this.persist();
  }

  private openAddRound() {
    this.editingRoundIndex = null;
    this.roundDraft = Object.fromEntries(
      this.game.players.map((p) => [p.id, 0])
    );
    this.openRoundDialog();
  }

  private openEditRound(index: number) {
    this.editingRoundIndex = index;
    this.roundDraft = { ...this.game.rounds[index].scores };
    this.openRoundDialog();
  }

  private openRoundDialog() {
    this.roundDialog.showModal();
    this.updateComplete.then(() => {
      this.roundDialog.querySelector('input')?.focus();
    });
  }

  private cancelAddRound() {
    this.roundDialog.close();
  }

  private saveRound() {
    if (this.editingRoundIndex === null) {
      this.game.rounds.push({ scores: { ...this.roundDraft } });
      this.game.dealerId = nextDealerId(this.game);
    } else {
      this.game.rounds[this.editingRoundIndex] = {
        scores: { ...this.roundDraft },
      };
    }
    this.roundDialog.close();
    this.persist();
  }

  private openSettings() {
    this.settingsDialog.showModal();
  }

  private closeSettings() {
    this.settingsDialog.close();
  }

  private updateTargetScore(value: string) {
    const parsed = parseInt(value, 10);
    this.game.targetScore = Number.isFinite(parsed) ? parsed : 0;
    this.persist();
  }

  render() {
    const standings = standingsFor(this.game);
    const winner = winnerFor(this.game);
    const hasRounds = this.game.rounds.length > 0;
    const canRemovePlayers = this.game.players.length > 2;

    return html`
      <header>
        <span class="wordmark"><span class="badge">UNO</span> Scorecard</span>
        <div class="header-actions">
          <button
            class="icon-button"
            aria-label="Game settings"
            title="Game settings"
            @click=${this.openSettings}
          >
            ⚙
          </button>
          <sc-button variant="secondary" @click=${this.startNewGame}
            >New Game</sc-button
          >
        </div>
      </header>

      ${winner
        ? html`<div class="winner-banner">
            🎉 ${winner.name} wins with ${standings[0].total} points!
          </div>`
        : nothing}

      <section class="standings-section">
        <div class="section-header">
          <span class="section-title">Standings</span>
        </div>

        <div class="standings-card">
          <table class="standings-table">
            <caption class="sr-only">
              Player standings, sorted lowest score first
            </caption>
            <thead>
              <tr>
                <th class="place-col" scope="col">#</th>
                <th scope="col">Player</th>
                <th class="score-col" scope="col">Score</th>
                ${canRemovePlayers
                  ? html`<th class="action-col" scope="col">
                      <span class="sr-only">Actions</span>
                    </th>`
                  : nothing}
              </tr>
            </thead>
            <tbody>
              ${standings.map(({ player, total }, index) => {
                const isLeader = hasRounds && index === 0;
                const isDealer = player.id === this.game.dealerId;
                const behind = total - standings[0].total;
                const rowClasses = [
                  isLeader ? 'leader-row' : '',
                  isDealer ? 'dealer-row' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return html`
                  <tr class=${rowClasses}>
                    <td class="place-cell">${index + 1}</td>
                    <td class="name-cell">
                      <input
                        class="player-name"
                        aria-label="Player name"
                        data-player-id=${player.id}
                        .value=${player.name}
                        @change=${(e: Event) =>
                          this.renamePlayer(
                            player.id,
                            (e.target as HTMLInputElement).value
                          )}
                      />
                      ${hasRounds
                        ? isLeader
                          ? html`<div class="status-line status-leading">
                              ★ Leading
                            </div>`
                          : html`<div class="status-line status-behind">
                              +${behind} behind
                            </div>`
                        : nothing}
                    </td>
                    <td class="score-cell">${total}</td>
                    ${canRemovePlayers
                      ? html`<td class="action-cell">
                          <button
                            class="icon-button icon-button-sm"
                            aria-label="Remove ${player.name}"
                            title="Remove ${player.name}"
                            @click=${() => this.removePlayer(player.id)}
                          >
                            ×
                          </button>
                        </td>`
                      : nothing}
                </tr>
              `;
            })}
            </tbody>
          </table>
          <button class="add-row-button" @click=${this.addPlayer}>
            <span class="add-row-icon" aria-hidden="true">+</span>
            Add player
          </button>
        </div>
      </section>

      <section class="history-section">
        <div class="section-header">
          <span class="section-title">Rounds</span>
        </div>

        <div class="history-card">
          ${this.game.rounds.length === 0
            ? html`<p class="empty-rounds">No rounds yet. Add one below.</p>`
            : html`
                <table class="history-table">
                  <caption class="sr-only">
                    Score by round for each player
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Rnd</th>
                      ${this.game.players.map(
                        (p) => html`<th scope="col">${p.name}</th>`
                      )}
                      <th scope="col"><span class="sr-only">Edit</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.game.rounds.map((round, i) => {
                      const roundLow = Math.min(
                        ...Object.values(round.scores)
                      );
                      return html`
                        <tr>
                          <td>${i + 1}</td>
                          ${this.game.players.map((p) => {
                            const score = round.scores[p.id] ?? 0;
                            return html`<td
                              class=${score === roundLow ? 'leader-cell' : ''}
                            >
                              ${score}
                            </td>`;
                          })}
                          <td>
                            <button
                              class="icon-button icon-button-sm"
                              aria-label="Edit round ${i + 1}"
                              title="Edit round ${i + 1}"
                              @click=${() => this.openEditRound(i)}
                            >
                              ✎
                            </button>
                          </td>
                        </tr>
                      `;
                    })}
                  </tbody>
                </table>
              `}
          <button class="add-row-button" @click=${this.openAddRound}>
            <span class="add-row-icon" aria-hidden="true">+</span>
            Add round
          </button>
        </div>
      </section>

      <dialog
        id="round-dialog"
        class="dialog"
        aria-labelledby="round-dialog-title"
      >
        <h2 class="dialog-title" id="round-dialog-title">
          Round
          ${this.editingRoundIndex === null
            ? this.game.rounds.length + 1
            : this.editingRoundIndex + 1}
        </h2>
        <div class="round-form-grid">
          ${this.game.players.map(
            (p, index) => html`
              <div class="round-form-row">
                <label for="round-${p.id}">${p.name}</label>
                <input
                  id="round-${p.id}"
                  class="field"
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
                  @keydown=${(e: KeyboardEvent) => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    const isLast = index === this.game.players.length - 1;
                    if (isLast) {
                      this.saveRound();
                      return;
                    }
                    const nextPlayer = this.game.players[index + 1];
                    const nextInput =
                      this.roundDialog.querySelector<HTMLInputElement>(
                        `#round-${nextPlayer.id}`
                      );
                    nextInput?.focus();
                    nextInput?.select();
                  }}
                />
              </div>
            `
          )}
        </div>
        <div class="round-form-actions">
          <sc-button @click=${this.saveRound}
            >${this.editingRoundIndex === null
              ? 'Save Round'
              : 'Save Changes'}</sc-button
          >
          <sc-button variant="secondary" @click=${this.cancelAddRound}
            >Cancel</sc-button
          >
        </div>
      </dialog>

      <dialog
        id="settings-dialog"
        class="dialog settings-dialog"
        aria-labelledby="settings-dialog-title"
      >
        <h2 class="dialog-title" id="settings-dialog-title">
          Game Settings
        </h2>
        <div class="round-form-row">
          <label for="target-score">Target score</label>
          <input
            id="target-score"
            class="field"
            type="number"
            .value=${String(this.game.targetScore)}
            @change=${(e: Event) =>
              this.updateTargetScore((e.target as HTMLInputElement).value)}
          />
        </div>
        <div class="round-form-actions" style="margin-top: var(--space-4)">
          <sc-button @click=${this.closeSettings}>Done</sc-button>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uno-game': UnoGame;
  }
}
