// src/llm.js - single LLM client that can point at any OpenAI-compatible provider
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
console.log("Using provider:", process.env.GEMINI_API_KEY || "gemini");

const PROVIDERS = {
  gemini: {
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL,
  },
  ollama: {
    baseURL: "http://localhost:11434/v1",
    apiKey: "ollama", // Ollama ignores the key but the SDK requires one
    model: "llama3.2",
  },
  groq: {
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL,
  },
};

const config = PROVIDERS[process.env.PROVIDER || "gemini"];
if (!config) throw new Error(`Unknown PROVIDER: ${process.env.PROVIDER}`);
if (!config.apiKey) throw new Error(`Missing API key for ${process.env.PROVIDER}`);

export const client = new OpenAI({ baseURL: config.baseURL, apiKey: config.apiKey });
export const MODEL = config.model;