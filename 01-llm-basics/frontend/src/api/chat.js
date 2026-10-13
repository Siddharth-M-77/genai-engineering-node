// src/api/chat.js - every call to the backend lives here

// GET /info -> { provider, model, systemPrompt }
export async function getInfo() {
  const res = await fetch('/info')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// POST JSON and throw a readable error for 4xx/5xx (e.g. validate() returning 400)
async function post(url, body, signal) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }))
    const err = new Error(data.error || `HTTP ${res.status}`)
    err.status = res.status
    err.raw = `HTTP ${res.status}\n${JSON.stringify(data, null, 2)}`
    throw err
  }
  return res
}

// POST /chat -> waits for the full reply: { reply, usage }
export async function chat(body, { signal, onOpen }) {
  const res = await post('/chat', body, signal)
  onOpen?.()
  return res.json()
}

// POST /chat/stream -> reads Server-Sent Events ("data: {...}\n\n") as they arrive
export async function streamChat(body, { signal, onOpen, onEvent, onDelta }) {
  const res = await post('/chat/stream', body, signal)
  onOpen?.()

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  let reply = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value

    const events = buffer.split('\n\n')
    buffer = events.pop()

    for (const event of events) {
      onEvent?.(event)
      const data = event.replace(/^data: /, '')
      if (data === '[DONE]') return reply

      const parsed = JSON.parse(data)
      if (parsed.error) throw new Error(parsed.error)
      if (parsed.delta) {
        reply += parsed.delta
        onDelta?.(parsed.delta, reply)
      }
    }
  }
  return reply
}
