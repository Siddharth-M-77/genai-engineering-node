import { renderMarkdown } from '../utils/markdown.js'

// One chat bubble. Assistant status: loading -> streaming -> done | stopped | error
export default function Message({ message }) {
  const { role, content, status, meta } = message

  if (role === 'user') return <div className="msg user">{content}</div>

  if (status === 'loading') {
    return (
      <div className="msg bot">
        <span className="dots">
          <span />
          <span />
          <span />
        </span>
      </div>
    )
  }

  if (status === 'error') return <div className="msg bot error">⚠️ {content}</div>

  return (
    <div className={`msg bot ${status === 'streaming' ? 'cursor' : ''}`}>
      {/* renderMarkdown escapes HTML first, so this is safe */}
      <div className="md" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
      {meta && <span className="meta">{meta}</span>}
    </div>
  )
}
