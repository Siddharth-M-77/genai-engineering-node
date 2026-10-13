// src/list-models.js - prints model IDs available for the current provider
import { client } from "./llm.js";

for await (const model of client.models.list()) {
  console.log(model.id);
}