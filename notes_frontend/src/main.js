/* eslint-env browser */
import './theme.css';
import { NotesProvider } from './store/NotesContext.js';
import { App } from './ui/App.js';

// Mount the app
const root = document.getElementById('app');
root.innerHTML = '';

/**
 * Simple mount helper to keep code modular without frameworks.
 * We compose our SPA using vanilla JS + Context-style store.
 */
function mount() {
  // Create container
  const container = document.createElement('div');
  container.id = 'app-root';
  root.appendChild(container);

  // Provide store and render the App shell
  NotesProvider.init();
  App.render(container);
}

mount();

// Keyboard shortcut: Ctrl/Cmd + S to save current note via store
document.addEventListener('keydown', (e) => {
  const platform =
    (typeof globalThis !== 'undefined' &&
      globalThis.navigator &&
      globalThis.navigator.platform) ||
    '';
  const isMac = String(platform).toUpperCase().includes('MAC');

  if ((isMac ? e.metaKey : e.ctrlKey) && String(e.key).toLowerCase() === 's') {
    e.preventDefault();
    const store = NotesProvider.get();
    if (store && store.saveSelectedNote) {
      store.saveSelectedNote();
    }
  }
});
