// src/hooks/useChat.js - all chat state and the send/stop/clear logic
import { useRef, useState } from 'react'
import { chat, streamChat } from '../api/chat.js'

const EMPTY_INSPECT = {
  endpoint: null,
  step: null, // send | validate | llm | recv | done
  failed: false,
  ttft: null, // time to first token
  total: null,
  chunks: null,
  promptTokens: null,
  completionTokens: null,
  requestBody: null, // what the browser sends to the server
  llmMessages: null, // what the server sends to the LLM (buildMessages)
  raw: '', // exact response text from the server
}

const ABORT_NOTE =
  "\n// You pressed Stop: browser closed the connection.\n// server.js: res.on('close') -> controller.abort() -> LLM stopped, no more tokens billed."

let nextId = 0

export function useChat(systemPrompt) {
  const [messages, setMessages] = useState([]) // what the chat shows
  const [history, setHistory] = useState([]) // finished turns we send back, because the LLM remembers nothing
  const [mode, setMode] = useState('stream') // "stream" -> /chat/stream, "normal" -> /chat
  const [sendHistory, setSendHistory] = useState(true)
  const [inspect, setInspect] = useState(EMPTY_INSPECT)
  const [busy, setBusy] = useState(false)
  const controllerRef = useRef(null) // AbortController of the request in flight

  const patchInspect = (patch) => setInspect((prev) => ({ ...prev, ...patch }))
  const patchMessage = (id, patch) => setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))

  async function send(text) {
    const message = text.trim()
    if (!message || controllerRef.current) return

    const past = sendHistory ? history : []
    const body = past.length ? { message, history: past } : { message } // same shape server.js expects
    const endpoint = mode === 'stream' ? '/chat/stream' : '/chat'
    const botId = ++nextId

    setMessages((prev) => [
      ...prev,
      { id: ++nextId, role: 'user', content: message },
      { id: botId, role: 'assistant', content: '', status: 'loading' },
    ])
    setInspect({
      ...EMPTY_INSPECT,
      endpoint: `POST ${endpoint}`,
      step: 'send',
      requestBody: body,
      // Mirrors buildMessages() in server.js
      llmMessages: [{ role: 'system', content: systemPrompt }, ...past, { role: 'user', content: message }],
    })

    const controller = new AbortController()
    controllerRef.current = controller
    setBusy(true)

    const start = performance.now()
    const elapsed = () => `${Math.round(performance.now() - start)} ms`
    const isCurrent = () => controllerRef.current === controller // false after Clear
    const onOpen = () => patchInspect({ step: 'llm' }) // server accepted the request (validate passed)
    let reply = ''

    try {
      if (mode === 'stream') {
        let chunks = 0
        patchInspect({ promptTokens: 'n/a', completionTokens: 'n/a' })
        reply = await streamChat(body, {
          signal: controller.signal,
          onOpen,
          onEvent: (event) => setInspect((prev) => ({ ...prev, raw: prev.raw + event + '\n\n' })),
          onDelta: (_delta, soFar) => {
            chunks++
            reply = soFar
            patchInspect(chunks === 1 ? { chunks, ttft: elapsed(), step: 'recv' } : { chunks })
            patchMessage(botId, { content: soFar, status: 'streaming' })
          },
        })
      } else {
        const data = await chat(body, { signal: controller.signal, onOpen })
        reply = data.reply
        patchInspect({
          step: 'recv',
          ttft: elapsed(), // first word arrives together with the last one
          chunks: 1,
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          raw: JSON.stringify(data, null, 2),
        })
      }

      patchMessage(botId, { content: reply, status: 'done', meta: `${mode} · ${elapsed()}` })
      patchInspect({ step: 'done', total: elapsed() })
    } catch (err) {
      if (!isCurrent()) return
      if (err.name === 'AbortError') {
        patchMessage(botId, { content: reply, status: 'stopped', meta: '⏹ stopped by you' })
        setInspect((prev) => ({ ...prev, step: 'done', total: elapsed(), raw: prev.raw + ABORT_NOTE }))
      } else {
        patchMessage(botId, { content: err.message, status: 'error' })
        setInspect((prev) => ({
          ...prev,
          failed: true,
          step: err.status === 400 ? 'validate' : prev.step,
          total: elapsed(),
          raw: err.raw ?? prev.raw,
        }))
      }
    } finally {
      if (isCurrent()) {
        // Save the turn so the next request can send it as history
        if (reply) {
          setHistory((prev) => [...prev, { role: 'user', content: message }, { role: 'assistant', content: reply }])
        }
        controllerRef.current = null
        setBusy(false)
      }
    }
  }

  function stop() {
    controllerRef.current?.abort()
  }

  function clear() {
    const controller = controllerRef.current
    controllerRef.current = null
    controller?.abort()
    setBusy(false)
    setMessages([])
    setHistory([])
    setInspect(EMPTY_INSPECT)
  }

  return { messages, history, mode, setMode, sendHistory, setSendHistory, inspect, busy, send, stop, clear }
}
