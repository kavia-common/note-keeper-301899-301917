/* eslint-env browser */
/**
 * NoteListItem: renders a single note row with last updated timestamp.
 */

// PUBLIC_INTERFACE
export const NoteListItem = {
  /** Create and return DOM node for a note list item */
  create(note, active, onSelect) {
    const el = document.createElement('div');
    el.className = 'note-item' + (active ? ' active' : '');
    el.innerHTML = `
      <div class="title">${escapeHtml(note.title || 'Untitled')}</div>
      <div class="meta">Updated ${timeAgo(note.updatedAt)}</div>
    `;
    el.addEventListener('click', () => onSelect?.(note.id));
    return el;
  },
};

function timeAgo(ts) {
  if (!ts) return 'just now';
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleString();
}

function escapeHtml(str) {
  return (str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
