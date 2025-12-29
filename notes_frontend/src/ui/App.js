/**
 * App shell: Sidebar + Main editor
 */
import { Sidebar } from './Sidebar.js';
import { Editor } from './Editor.js';
import { NotesProvider } from '../store/NotesContext.js';

// PUBLIC_INTERFACE
export const App = {
  /** Render application layout into container */
  render(container) {
    container.className = 'app-shell';

    const sidebarEl = document.createElement('aside');
    sidebarEl.className = 'sidebar';
    container.appendChild(sidebarEl);
    Sidebar.render(sidebarEl);

    const mainEl = document.createElement('main');
    mainEl.className = 'main';
    container.appendChild(mainEl);
    Editor.render(mainEl);

    // Subscribe to state updates to refresh title etc. if needed
    NotesProvider.subscribe(() => {
      // no-op here; children manage their own subscriptions
    });
  },
};
