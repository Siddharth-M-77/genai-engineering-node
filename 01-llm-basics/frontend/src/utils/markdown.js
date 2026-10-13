// src/utils/markdown.js - tiny markdown renderer for LLM replies

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

// Handles ```code blocks```, `inline code`, **bold** and line breaks.
// Escapes HTML first, so LLM output can never inject tags or scripts.
export function renderMarkdown(text) {
  return escapeHtml(text)
    .split('```')
    .map((part, i) => {
      if (i % 2 === 1) return `<pre><code>${part.replace(/^\w*\n/, '')}</code></pre>`
      return part
        .replace(/`([^`\n]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
        .replace(/\n/g, '<br>')
    })
    .join('')
}
