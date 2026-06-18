import { LitElement, html, css } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { routes } from './router/routes.js';

@customElement('app-shell')
export class AppShell extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    main {
      max-width: 720px;
      margin: 0 auto;
      padding: var(--space-5) var(--space-4);
    }
  `;

  @query('#outlet') outlet!: HTMLElement;

  firstUpdated() {
    const router = new Router(this.outlet);
    router.setRoutes(routes);
  }

  render() {
    return html`<main id="outlet"></main>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
