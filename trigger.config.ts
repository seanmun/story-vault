import { defineConfig } from "@trigger.dev/sdk";
import { syncEnvVars } from "@trigger.dev/build/extensions/core";
import { readFileSync } from "node:fs";

// Env vars the tasks need at runtime on Trigger.dev's workers. Synced from
// .env.local on every `trigger.dev deploy` — no dashboard entry needed.
const TASK_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DEEPGRAM_API_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "TRANSCRIPTION_PROVIDER",
  "LLM_PROVIDER",
];

function readEnvLocal(): Record<string, string> {
  const vars: Record<string, string> = {};
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match && TASK_ENV_KEYS.includes(match[1]) && match[2]) {
        vars[match[1]] = match[2];
      }
    }
  } catch {
    // No .env.local (e.g. CI) — fall back to process.env below.
  }
  for (const key of TASK_ENV_KEYS) {
    if (!vars[key] && process.env[key]) {
      vars[key] = process.env[key]!;
    }
  }
  return vars;
}

export default defineConfig({
  project: "proj_xkbhrclufzquqiasnaar",
  dirs: ["trigger"],
  maxDuration: 600,
  build: {
    extensions: [syncEnvVars(() => readEnvLocal())],
  },
});
