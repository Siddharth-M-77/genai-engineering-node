// src/server.js - chat API with normal and streaming (SSE) endpoints
import express from "express";
import { client, MODEL } from "./llm.js";

const app = express();
app.use(express.json());

const SYSTEM_PROMPT = "You are a concise, helpful assistant for a developer. Answer in under 120 words.";

// Build the message array: system prompt + optional past turns + new user message
function buildMessages(message, history = []) {
  return [{ role: "system", content: SYSTEM_PROMPT }, ...history, { role: "user", content: message }];
}

// Basic input validation shared by both endpoints
function validate(req, res) {
  const { message } = req.body || {};
  if (typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "message is required" });
    return null;
  }
  if (message.length > 4000) {
    res.status(400).json({ error: "message too long" });
    return null;
  }
  return message.trim();
}

// POST /chat - waits for the full answer, returns it with token usage
app.post("/chat", async (req, res) => {
  const message = validate(req, res);
  if (!message) return;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: buildMessages(message, req.body.history),
      temperature: 0.7,
    });

    res.json({
      reply: completion.choices[0]?.message?.content ?? "",
      usage: completion.usage, // prompt/completion/total tokens - this is what you pay for
    });
  } catch (err) {
    console.error("LLM error:", err.status, err.message);
    res.status(err.status || 500).json({ error: "LLM request failed" });
  }
});

// POST /chat/stream - sends tokens as they arrive using Server-Sent Events
app.post("/chat/stream", async (req, res) => {
  const message = validate(req, res);
  if (!message) return;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Stop the LLM call if the client disconnects mid-stream (saves tokens)
  const controller = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) controller.abort();
  });

  try {
    const stream = await client.chat.completions.create(
      {
        model: MODEL,
        messages: buildMessages(message, req.body.history),
        stream: true,
      },
      { signal: controller.signal }
    );

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Stream error:", err.status, err.message);
      res.write(`data: ${JSON.stringify({ error: "stream failed" })}\n\n`);
    }
  } finally {
    res.end();
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`AI server on :${PORT} using ${process.env.PROVIDER} / ${MODEL}`));