import { LitElement, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import styles from './home-page.css?inline';

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
  static styles = unsafeCSS(styles);

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
