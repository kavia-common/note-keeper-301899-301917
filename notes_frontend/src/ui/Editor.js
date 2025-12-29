/* eslint-env browser */
/**
 * Editor component: header with title, toolbar, and content area with markdown preview toggle.
 */
import { Store, NotesProvider } from '../store/NotesContext.js';
import { renderMarkdown } from './components/markdown.js';

// PUBLIC_INTERFACE
export const Editor = {
  render(root) {
    root.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'header';

    const titleInput = document.createElement('input');
    titleInput.className = 'input title-input';
    titleInput.placeholder = 'Note title...';

    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'Markdown';

    // Preview toggle
    const toggle = document.createElement('div');
    toggle.className = 'toggle';
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    const previewBtn = document.createElement('button');
    previewBtn.textContent = 'Preview';
    toggle.append(editBtn, previewBtn);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn secondary';
    saveBtn.textContent = 'Save';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn ghost';
    deleteBtn.style.borderColor = 'rgba(239,68,68,0.35)';
    deleteBtn.style.color = '#EF4444';
    deleteBtn.textContent = 'Delete';

    toolbar.append(badge, toggle, saveBtn, deleteBtn);

    const status = document.createElement('div');
    status.className = 'status';
    status.textContent = '';

    header.append(titleInput, toolbar, status);

    const editorWrap = document.createElement('div');
    editorWrap.className = 'editor-wrap';

    // Split editor/preview
    const split = document.createElement('div');
    split.className = 'editor-split';

    const textarea = document.createElement('textarea');
    textarea.className = 'textarea';
    textarea.placeholder = 'Write your markdown here...';

    const preview = document.createElement('div');
    preview.className = 'preview';

    split.append(textarea, preview);
    editorWrap.appendChild(split);

    root.append(header, editorWrap);

    // Handlers
    titleInput.addEventListener('input', (e) => {
      Store.updateSelected({ title: e.target.value });
    });

    textarea.addEventListener('input', (e) => {
      Store.updateSelected({ content: e.target.value });
    });

    saveBtn.addEventListener('click', () => Store.saveSelectedNote());
    deleteBtn.addEventListener('click', () => {
      const note = Store.getSelected();
      if (!note) return;
      const confirmFn =
        (typeof globalThis !== 'undefined' && globalThis.confirm) || null;
      const ok = typeof confirmFn === 'function' ? confirmFn('Delete this note?') : true;
      if (ok) Store.deleteSelected();
    });

    editBtn.addEventListener('click', () => Store.setPreview(false));
    previewBtn.addEventListener('click', () => Store.setPreview(true));

    // Render state
    function render(state) {
      const note = Store.getSelected();

      if (!note) {
        root.innerHTML = `
          <div class="empty-state">
            <h2>No note selected</h2>
            <p>Select a note from the sidebar or create a new one.</p>
            <button class="btn">Create Note</button>
          </div>
        `;
        root.querySelector('button').addEventListener('click', () => Store.createNote());
        return;
      }

      // Ensure header/editor elements exist (if re-rendered from empty state)
      if (!root.contains(header)) {
        root.innerHTML = '';
        root.append(header, editorWrap);
      }

      // Inputs
      if (titleInput.value !== note.title) titleInput.value = note.title ?? '';
      if (textarea.value !== note.content) textarea.value = note.content ?? '';

      // Preview toggle styling
      const previewOn = state.preview;
      if (previewOn) {
        editBtn.classList.remove('active');
        previewBtn.classList.add('active');
      } else {
        previewBtn.classList.remove('active');
        editBtn.classList.add('active');
      }

      // Status
      if (state.saving) {
        status.textContent = 'Saving...';
      } else if (state.lastSavedAt) {
        status.textContent = `Saved ${timeAgo(state.lastSavedAt)}`;
      } else {
        status.textContent = '';
      }

      // Layout behavior when preview toggled:
      if (previewOn) {
        // Keep split view with live update
        preview.innerHTML = renderMarkdown(textarea.value);
      } else {
        preview.innerHTML = '';
      }
    }

    const unsub = NotesProvider.subscribe(render);
    root._unsub = unsub;
  },
};

function timeAgo(ts) {
  if (!ts) return '';
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
