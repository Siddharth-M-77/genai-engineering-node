import { useEffect, useRef } from 'react'
import Message from './Message.jsx'

const SUGGESTIONS = [
  'JavaScript mein closure kya hai?',
  'Mera naam Siddharth hai, yaad rakhna',
  'Mera naam kya hai?',
  'Write a 200 word story about a robot',
]

export default function MessageList({ messages, onPick }) {
  const listRef = useRef(null)

  // Keep the newest message in view while tokens stream in
  useEffect(() => {
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  return (
    <div className="messages" ref={listRef}>
      {messages.length === 0 ? (
        <div className="empty">
          <h2>Ask Anythings 👋</h2>
          <p>Right side ka panel dikhayega ki andar kya ho raha hai: request, raw stream, tokens, timing.</p>
          <div className="chips">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => onPick(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((m) => <Message key={m.id} message={m} />)
      )}
    </div>
  )
}
