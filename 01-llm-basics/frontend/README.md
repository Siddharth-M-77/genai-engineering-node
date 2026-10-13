# 01-llm-basics / frontend

React + Vite playground for the chat API in `../src/server.js`.

```bash
# terminal 1 - backend (port 4000)
cd 01-llm-basics && npm run dev

# terminal 2 - frontend (port 5173)
cd 01-llm-basics/frontend && npm install && npm run dev
```

Vite proxies `/chat` and `/info` to the backend (see `vite.config.js`).

| File | Role |
|------|------|
| `src/api/chat.js` | All backend calls, including the SSE stream reader |
| `src/hooks/useChat.js` | Chat state, history, send / stop (AbortController) / clear |
| `src/components/` | Header, MessageList, Message, Composer, Inspector |
