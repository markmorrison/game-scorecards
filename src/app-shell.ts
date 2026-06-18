import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { routes } from './router/routes.js';
import styles from './app-shell.css?inline';

@customElement('app-shell')
export class AppShell extends LitElement {
  static styles = unsafeCSS(styles);

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
