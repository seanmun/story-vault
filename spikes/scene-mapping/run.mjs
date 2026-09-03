// Phase 4 spike: prove Claude can cut a real story into scenes whose
// boundaries land on the right words, using the word-level timestamps.
// Usage: node spikes/scene-mapping/run.mjs [recordingId]
import { readFileSync, writeFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, "").trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function rest(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!res.ok) throw new Error(`REST ${res.status}: ${await res.text()}`);
  return res.json();
}

// Pick the target recording: argv, else the longest one with word meta.
let recording;
if (process.argv[2]) {
  [recording] = await rest(
    `recordings?id=eq.${process.argv[2]}&select=id,duration_seconds,transcription,transcription_meta`
  );
} else {
  [recording] = await rest(
    `recordings?select=id,duration_seconds,transcription,transcription_meta&transcription_meta=not.is.null&order=duration_seconds.desc&limit=1`
  );
}
if (!recording?.transcription_meta?.words?.length) {
  console.error("No recording with word-level timestamps found. Run the backfill first.");
  process.exit(1);
}

const words = recording.transcription_meta.words;
const durationS = words[words.length - 1].end;
console.log(
  `Recording ${recording.id.slice(0, 8)} — ${words.length} words, ${Math.round(durationS)}s`
);

// Index markers every 25 words so the model can cite word indices reliably.
const marked = words
  .map((w, i) => (i % 25 === 0 ? `⟦${i}⟧${w.word}` : w.word))
  .join(" ");

const SYSTEM = `You are a film editor cutting a first-person spoken story into visual scenes for an illustrated video. The transcript has word-index markers like ⟦125⟧ before every 25th word — use them to compute exact word indices.

Scene rules:
- Break scenes on narrative events: new character, location change, time jump, dramatic turn. Never on a fixed interval.
- Target one scene per 30-60 seconds of speech; minimum scene length ~15 seconds of speech.
- start_word_index of scene 0 is 0; each scene starts where the previous ends; the last scene ends at the final word.
- Cut at natural sentence boundaries whenever possible.

Return ONLY a JSON object:
{
  "title": "evocative story title",
  "era": "year or period if inferable, else null",
  "characters": [{"name": "...", "role": "...", "physical_description_in_text": "quote or null"}],
  "scenes": [
    {
      "index": 0,
      "start_word_index": 0,
      "end_word_index": 42,
      "setting": "concrete visual setting",
      "beat": "one of: arrival, buildup, turn, climax, aftermath, reflection",
      "characters_present": ["narrator"],
      "image_prompt": "one-sentence visual description for an illustrator, no proper names"
    }
  ]
}`;

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
const response = await client.messages.create({
  model: "claude-opus-5",
  max_tokens: 8192,
  system: SYSTEM,
  messages: [{ role: "user", content: `Cut this story into scenes:\n\n${marked}` }],
});
const text = response.content
  .filter((b) => b.type === "text")
  .map((b) => b.text)
  .join("");
const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);

// Map word indices to timestamps and validate.
const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const warnings = [];
let report = `# Scene-mapping spike — recording ${recording.id.slice(0, 8)}\n\n`;
report += `**Story:** ${json.title} (${json.era ?? "era unknown"}) · ${words.length} words · ${fmt(durationS)}\n\n`;
report += `**Characters:** ${json.characters.map((c) => `${c.name} (${c.role})`).join(", ") || "none"}\n\n`;

let prevEnd = 0;
for (const sc of json.scenes) {
  const si = Math.max(0, Math.min(sc.start_word_index, words.length - 1));
  const ei = Math.max(0, Math.min(sc.end_word_index, words.length - 1));
  const startT = words[si].start;
  const endT = words[ei].end;
  const dur = endT - startT;
  const snippet = words.slice(si, Math.min(si + 12, ei + 1)).map((w) => w.word).join(" ");
  const prevWord = si > 0 ? words[si - 1].word : "";
  const cleanCut = si === 0 || /[.!?]$/.test(prevWord);

  if (dur < 15) warnings.push(`scene ${sc.index}: only ${dur.toFixed(1)}s (<15s minimum)`);
  if (si !== prevEnd) warnings.push(`scene ${sc.index}: gap/overlap — starts at word ${si}, previous ended at ${prevEnd}`);
  if (!cleanCut) warnings.push(`scene ${sc.index}: cut mid-sentence (previous word: "${prevWord}")`);
  prevEnd = ei + 1;

  report += `## Scene ${sc.index} · ${fmt(startT)}–${fmt(endT)} (${dur.toFixed(0)}s) · ${sc.beat}\n`;
  report += `- **Setting:** ${sc.setting}\n`;
  report += `- **Opens on:** "${snippet}..."${cleanCut ? "" : " ⚠️ mid-sentence"}\n`;
  report += `- **Image prompt:** ${sc.image_prompt}\n\n`;
}
if (prevEnd !== words.length)
  warnings.push(`last scene ends at word ${prevEnd - 1}, transcript has ${words.length} words`);

report += `## Validation\n${warnings.length ? warnings.map((w) => `- ⚠️ ${w}`).join("\n") : "- ✅ all cuts clean: full coverage, no gaps, sentence-boundary cuts, all scenes ≥15s"}\n`;
report += `\nTokens: ${response.usage.input_tokens} in / ${response.usage.output_tokens} out\n`;

const out = `spikes/scene-mapping/report-${recording.id.slice(0, 8)}.md`;
writeFileSync(out, report);
console.log(report);
console.log(`\nSaved: ${out}`);
