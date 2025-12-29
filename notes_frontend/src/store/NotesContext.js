/**
 * Simple store singleton to manage notes state and actions.
 * Designed for vanilla JS apps (no React), providing a minimal event system.
 */

import { getService } from '../services/notesService.js';

const subscribers = new Set();
let state = {
  notes: [],
  selectedId: null,
  search: '',
  preview: false,
  lastSavedAt: null,
  saving: false,
};

let service = getService();

/**
 * Emit state updates to subscribers (components).
 */
function emit() {
  for (const cb of subscribers) {
    try {
      cb(state);
    } catch {
      // Intentionally ignore subscriber errors to keep store robust
    }
  }
}

/**
 * PUBLIC_INTERFACE
 * NotesProvider
 * Initializes and exposes the store.
 */
export const NotesProvider = {
  /** Initialize store and load initial notes */
  async init() {
    service = getService();
    await service.seedIfEmpty?.();
    const notes = await service.list();
    state = { ...state, notes, selectedId: notes[0]?.id || null };
    emit();
  },

  /** Subscribe to state updates, returns unsubscribe function */
  subscribe(cb) {
    subscribers.add(cb);
    cb(state);
    return () => subscribers.delete(cb);
  },

  /** Accessor for store actions and state */
  get() {
    return Store;
  },
};

/**
 * Derived helpers
 */
function filteredNotes() {
  const q = (state.search || '').trim().toLowerCase();
  if (!q) return state.notes;
  return state.notes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
  );
}

function selectedNote() {
  return state.notes.find((n) => n.id === state.selectedId) || null;
}

/**
 * PUBLIC_INTERFACE
 * Store
 * Exposed actions and selectors for UI.
 */
export const Store = {
  getState: () => state,
  getNotes: () => filteredNotes(),
  getSelected: () => selectedNote(),

  async refresh() {
    state = { ...state, notes: await service.list() };
    emit();
  },

  setSearch(q) {
    state = { ...state, search: q };
    emit();
  },

  setPreview(on) {
    state = { ...state, preview: on };
    emit();
  },

  async createNote() {
    const created = await service.create({ title: 'Untitled', content: '' });
    const notes = await service.list();
    state = {
      ...state,
      notes,
      selectedId: created.id,
      lastSavedAt: Date.now(),
    };
    emit();
  },

  selectNote(id) {
    state = { ...state, selectedId: id };
    emit();
  },

  async updateSelected(fields) {
    const current = selectedNote();
    if (!current) return;
    const updated = { ...current, ...fields };
    // Optimistic update
    state = {
      ...state,
      notes: state.notes.map((n) => (n.id === current.id ? updated : n)),
    };
    emit();
  },

  async saveSelectedNote() {
    const current = selectedNote();
    if (!current) return;
    state = { ...state, saving: true };
    emit();
    const saved = await service.update(current.id, {
      title: current.title,
      content: current.content,
    });
    if (saved) {
      const notes = await service.list();
      state = {
        ...state,
        notes,
        saving: false,
        lastSavedAt: Date.now(),
      };
      emit();
    } else {
      state = { ...state, saving: false };
      emit();
    }
  },

  async deleteSelected() {
    const current = selectedNote();
    if (!current) return;
    await service.remove(current.id);
    const notes = await service.list();
    state = {
      ...state,
      notes,
      selectedId: notes[0]?.id || null,
      lastSavedAt: Date.now(),
    };
    emit();
  },
};
