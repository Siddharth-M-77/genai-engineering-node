# GenAI Engineering with Node.js

Learning GenAI engineering step by step: LLM APIs, structured output, RAG, tool calling, agents and MCP, all in Node.js.

Each folder is a standalone project with its own `package.json` and `.env`.

## Roadmap

| # | Folder | What it teaches | Status |
|---|--------|-----------------|--------|
| 01 | [01-llm-basics](01-llm-basics/) | Chat API with Express, SSE streaming, switching between OpenAI-compatible providers (Gemini, Groq, Ollama), token usage | ✅ Done |
| 02 | [02-structured-output](02-structured-output/) | Getting reliable JSON from LLMs, schema validation (Zod), retries | ⏳ |
| 03 | [03-rag](03-rag/) | Embeddings, chunking, vector search, answering questions from your own documents | ⏳ |
| 04 | [04-tool-calling](04-tool-calling/) | Function/tool calling, letting the LLM call your code and APIs | ⏳ |
| 05 | [05-agents](05-agents/) | Agent loop: plan, call tools, observe, repeat; memory and guardrails | ⏳ |
| 06 | [06-mcp-server](06-mcp-server/) | Building a Model Context Protocol server that exposes tools to any MCP client | ⏳ |

## Running a module

```bash
cd 01-llm-basics
cp .env.example .env   # add your API keys
npm install
npm run dev
```

## Stack

Node.js (ES modules), Express, `openai` SDK pointed at OpenAI-compatible endpoints.
