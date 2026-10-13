import { useEffect, useRef, useState } from 'react'

// Input box + mode toggle + history toggle + Send/Stop/Clear
export default function Composer({ busy, mode, setMode, sendHistory, setSendHistory, historyCount, onSend, onStop, onClear }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  // Grow the textarea with its content
  useEffect(() => {
    const el = inputRef.current
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [text])

  function handleSubmit(e) {
    e.preventDefault()
    if (busy) return onStop() // the button turns into Stop while a reply is coming
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.form.requestSubmit()
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <textarea
        ref={inputRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message likho… (Enter = send, Shift+Enter = new line)"
      />
      <div className="controls">
        <div className="segmented" role="radiogroup" aria-label="Mode">
          <button type="button" className={`seg ${mode === 'stream' ? 'active' : ''}`} onClick={() => setMode('stream')} title="POST /chat/stream (SSE)">
            ⚡ Stream
          </button>
          <button type="button" className={`seg ${mode === 'normal' ? 'active' : ''}`} onClick={() => setMode('normal')} title="POST /chat">
            📦 Normal
          </button>
        </div>
        <label className="toggle" title="Off karo to LLM pichli baat bhool jayega">
          <input type="checkbox" checked={sendHistory} onChange={(e) => setSendHistory(e.target.checked)} />
          <span>
            Send history <b>({historyCount})</b>
          </span>
        </label>
        <button type="button" className="ghost" onClick={onClear}>
          Clear
        </button>
        <button type="submit" className={`primary ${busy ? 'stop' : ''}`}>
          {busy ? 'Stop' : 'Send'}
        </button>
      </div>
    </form>
  )
}
