import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  // Find this in the Trigger.dev dashboard: Project → Settings → Project ref
  // (starts with "proj_"). Set TRIGGER_PROJECT_REF in .env.local or replace
  // the placeholder.
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_REPLACE_ME",
  dirs: ["trigger"],
  maxDuration: 600,
});
