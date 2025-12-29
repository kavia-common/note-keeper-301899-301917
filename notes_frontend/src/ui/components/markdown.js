/**
 * Very lightweight markdown renderer (subset):
 * - #, ##, ### headings
 * - bold **text**, italic *text*
 * - inline code `code`
 * - fenced code blocks ```lang ... ```
 * - unordered lists starting with - or *
 * - paragraphs and line breaks
 *
 * This is intentionally simple to avoid extra dependencies.
 */

// PUBLIC_INTERFACE
export function renderMarkdown(src) {
  if (!src) return '';

  // Escape HTML
  let text = src.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

  // Code fences
  text = text.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre class="code"><code>${code.trim()}</code></pre>`;
  });

  // Headings
  text = text
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>');

  // Bold and italic (basic)
  text = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Lists
  text = text.replace(/^(?:-|\*) (.*)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> into <ul>
  text = text.replace(/(?:<li>.*<\/li>\n?)+/g, (m) => `<ul>${m.replace(/\n/g, '')}</ul>`);

  // Paragraphs and line breaks
  text = text
    .split(/\n{2,}/)
    .map((block) => {
      if (/^<h[1-3]>/.test(block) || /^<ul>/.test(block) || /^<pre /.test(block)) return block;
      return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return text;
}
