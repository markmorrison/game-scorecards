import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

interface GameEntry {
  slug: string;
  name: string;
  accent: string;
  description: string;
}

const GAMES: GameEntry[] = [
  {
    slug: 'uno',
    name: 'Uno',
    accent: '#e8222c',
    description: 'Track round scores and crown a winner at the target score.',
  },
];

@customElement('home-page')
export class HomePage extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    h1 {
      font-size: var(--font-size-xl);
      margin-bottom: var(--space-2);
    }

    p.intro {
      color: var(--color-text-muted);
      margin-bottom: var(--space-6);
    }

    .games {
      display: grid;
      gap: var(--space-4);
    }

    a.game-card {
      display: block;
      padding: var(--space-5);
      border-radius: var(--radius);
      border: var(--border-width) solid var(--color-border);
      background: var(--color-surface);
      text-decoration: none;
      color: var(--color-text);
      border-left-width: 4px;
      transition: border-color 0.15s ease;
    }

    .game-name {
      font-size: var(--font-size-lg);
      font-weight: 700;
      margin-bottom: var(--space-1);
    }

    .game-desc {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }
  `;

  render() {
    return html`
      <h1>Scorecard</h1>
      <p class="intro">Pick a game to start keeping score.</p>
      <div class="games">
        ${GAMES.map(
          (game) => html`
            <a
              class="game-card"
              href="/${game.slug}"
              style="border-left-color: ${game.accent}"
            >
              <div class="game-name">${game.name}</div>
              <div class="game-desc">${game.description}</div>
            </a>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'home-page': HomePage;
  }
}
