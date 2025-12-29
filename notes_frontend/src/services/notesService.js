/* eslint-env browser */
/**
 * Notes data service with pluggable backends:
 * - local (localStorage)
 * - api (future-ready via VITE_API_BASE)
 *
 * PUBLIC_INTERFACE
 * getService() returns the active notes service based on environment.
 */
const API_BASE = import.meta.env.VITE_API_BASE;

/**
 * PUBLIC_INTERFACE
 * getService
 * Returns the appropriate service depending on environment.
 */
export function getService() {
  if (API_BASE && typeof API_BASE === 'string' && API_BASE.trim().length > 0) {
    // Placeholder: fall back to local for now; structure prepared for future API.
    return LocalNotesService;
  }
  return LocalNotesService;
}

const STORAGE_KEY = 'notes_app.notes.v1';

/**
 * Representation:
 * {
 *   id: string,
 *   title: string,
 *   content: string,
 *   updatedAt: number
 * }
 */
function uid() {
  return 'note_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function hasLocalStorage() {
  try {
    return (
      typeof globalThis !== 'undefined' &&
      globalThis &&
      Object.prototype.hasOwnProperty.call(globalThis, 'localStorage') &&
      !!globalThis.localStorage
    );
  } catch {
    return false;
  }
}

function loadAll() {
  try {
    if (!hasLocalStorage()) return [];
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function persistAll(list) {
  if (!hasLocalStorage()) return;
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * PUBLIC_INTERFACE
 * LocalNotesService
 * Minimal CRUD with localStorage persistence.
 */
export const LocalNotesService = {
  /** List notes sorted by updatedAt desc */
  async list() {
    const list = loadAll();
    return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  },

  /** Create a new note with optional initial fields */
  async create({ title = 'Untitled', content = '' } = {}) {
    const note = {
      id: uid(),
      title,
      content,
      updatedAt: Date.now(),
    };
    const list = loadAll();
    list.push(note);
    persistAll(list);
    return note;
  },

  /** Get a single note by id */
  async get(id) {
    const list = loadAll();
    return list.find((n) => n.id === id) || null;
  },

  /** Update a note by id with provided fields */
  async update(id, fields) {
    const list = loadAll();
    const idx = list.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    const next = { ...list[idx], ...fields, updatedAt: Date.now() };
    list[idx] = next;
    persistAll(list);
    return next;
  },

  /** Delete a note by id */
  async remove(id) {
    const list = loadAll();
    const next = list.filter((n) => n.id !== id);
    persistAll(next);
    return true;
  },

  /** Seed example notes if empty */
  async seedIfEmpty() {
    const list = loadAll();
    if (list.length) return;
    const now = Date.now();
    const samples = [
      {
        id: uid(),
        title: 'Welcome to Ocean Notes',
        content:
`# Ocean Notes

This is your modern notes app.

- Create, edit, delete
- Markdown preview
- Local persistence

Tips:
- Use Ctrl/Cmd + S to save
- Toggle markdown preview on the toolbar
- Search notes from the sidebar`,
        updatedAt: now,
      },
      {
        id: uid(),
        title: 'Daily Journal',
        content: 'Write your thoughts here...',
        updatedAt: now - 1000 * 60 * 60,
      },
    ];
    persistAll(samples);
  },
};
