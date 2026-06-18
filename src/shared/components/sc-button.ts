import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './sc-button.css?inline';

@customElement('sc-button')
export class ScButton extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: String }) variant: 'primary' | 'secondary' | 'ghost' =
    'primary';

  @property({ type: Boolean }) disabled = false;

  @property({ type: String }) type: 'button' | 'submit' = 'button';

  render() {
    return html`
      <button
        type=${this.type}
        class=${this.variant}
        ?disabled=${this.disabled}
      >
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
