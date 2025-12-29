/**
 * Sidebar component: brand, search, actions, and note list
 */
/* eslint-env browser */
import { Store, NotesProvider } from '../store/NotesContext.js';
import { NoteListItem } from './components/NoteListItem.js';

// PUBLIC_INTERFACE
export const Sidebar = {
  render(root) {
    root.innerHTML = '';

    // Brand
    const brand = document.createElement('div');
    brand.className = 'brand';
    brand.innerHTML = `
      <span class="dot"></span>
      <h1>Ocean Notes</h1>
    `;
    root.appendChild(brand);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'actions';
    const newBtn = document.createElement('button');
    newBtn.className = 'btn';
    newBtn.textContent = 'New Note';
    newBtn.addEventListener('click', () => Store.createNote());
    actions.appendChild(newBtn);
    root.appendChild(actions);

    // Search
    const search = document.createElement('input');
    search.className = 'input';
    search.type = 'search';
    search.placeholder = 'Search notes...';
    search.addEventListener('input', (e) => Store.setSearch(e.target.value));
    root.appendChild(search);

    // List
    const list = document.createElement('div');
    list.className = 'note-list';
    root.appendChild(list);

    function renderList(state) {
      const notes = Store.getNotes();
      const activeId = state.selectedId;

      list.innerHTML = '';
      if (notes.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `
          <h2>No notes found</h2>
          <p>Create your first note to get started.</p>
          <button class="btn">Create Note</button>
        `;
        empty.querySelector('button').addEventListener('click', () => Store.createNote());
        list.appendChild(empty);
        return;
      }

      for (const n of notes) {
        const item = NoteListItem.create(n, n.id === activeId, () => Store.selectNote(n.id));
        list.appendChild(item);
      }
    }

    // Subscribe
    const unsub = NotesProvider.subscribe((state) => {
      if (search.value !== state.search) search.value = state.search;
      renderList(state);
    });

    root._unsub = unsub;
  },
};
