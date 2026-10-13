import { useEffect, useRef, useState } from 'react'

const STEPS = [
  ['send', 'Browser → POST request'],
  ['validate', 'Server: validate()'],
  ['llm', 'Server → LLM call'],
  ['recv', 'LLM → reply aa raha hai'],
  ['done', 'Done'],
]

const TABS = {
  llm: {
    label: 'LLM ko kya gaya',
    hint: 'Server ye poora array LLM ko bhejta hai: system prompt + history + naya message. LLM ki apni memory nahi hoti, jo is array mein hai bas wahi use pata hai.',
  },
  req: {
    label: 'Request body',
    hint: 'Browser server ko sirf itna bhejta hai. System prompt server khud jodta hai (buildMessages).',
  },
  raw: {
    label: 'Raw response',
    hint: 'Server se aaya hua exact data. Stream mode mein SSE events (data: ...), Normal mode mein ek JSON.',
  },
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <b>{value ?? '-'}</b>
    </div>
  )
}

// Highlights where the current request is: done steps get ✓, the current one is active (or ✕ if it failed)
function Flow({ step, failed }) {
  const current = STEPS.findIndex(([id]) => id === step)
  return (
    <ol className="flow">
      {STEPS.map(([id, label], i) => {
        let cls = ''
        if (step === 'done' || i < current) cls = 'doneStep'
        else if (i === current) cls = failed ? 'failStep' : 'active'
        return (
          <li key={id} className={cls}>
            {label}
          </li>
        )
      })}
    </ol>
  )
}

export default function Inspector({ data }) {
  const [tab, setTab] = useState('llm')
  const codeRef = useRef(null)

  const content = {
    llm: data.llmMessages && JSON.stringify(data.llmMessages, null, 2),
    req: data.requestBody && JSON.stringify(data.requestBody, null, 2),
    raw: data.raw,
  }[tab]

  // Follow the stream on the Raw tab
  useEffect(() => {
    if (tab === 'raw') codeRef.current.scrollTop = codeRef.current.scrollHeight
  }, [tab, content])

  return (
    <aside className="inspector">
      <h2>Under the hood</h2>

      <div className="stats">
        <Stat label="Endpoint" value={data.endpoint} />
        <Stat label="First token" value={data.ttft} />
        <Stat label="Total time" value={data.total} />
        <Stat label="Chunks" value={data.chunks} />
        <Stat label="Prompt tokens" value={data.promptTokens} />
        <Stat label="Reply tokens" value={data.completionTokens} />
      </div>

      <Flow step={data.step} failed={data.failed} />

      <div className="tabs" role="tablist">
        {Object.entries(TABS).map(([id, t]) => (
          <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            {t.label}
          </button>
        ))}
      </div>
      <p className="hint">{TABS[tab].hint}</p>
      <pre className="code" ref={codeRef}>
        {content || 'Pehla message bhejo…'}
      </pre>
    </aside>
  )
}
