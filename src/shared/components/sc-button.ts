import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('sc-button')
export class ScButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius);
      border: var(--border-width) solid transparent;
      font-size: var(--font-size-base);
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s ease, background-color 0.15s ease;
    }

    button:active {
      opacity: 0.85;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .primary {
      background: var(--game-accent);
      color: var(--game-accent-contrast);
    }

    .secondary {
      background: transparent;
      color: var(--color-text);
      border-color: var(--color-border);
    }

    .ghost {
      background: transparent;
      color: var(--color-text-muted);
    }
  `;

  @property({ type: String }) variant: 'primary' | 'secondary' | 'ghost' =
    'primary';

  @property({ type: Boolean }) disabled = false;

  render() {
    return html`
      <button class=${this.variant} ?disabled=${this.disabled}>
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sc-button': ScButton;
  }
}
