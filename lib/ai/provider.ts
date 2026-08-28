import Anthropic from "@anthropic-ai/sdk";

interface LLMResponse {
  text: string;
}

export async function generateWithLLM(
  systemPrompt: string,
  userPrompt: string
): Promise<LLMResponse> {
  const provider = process.env.LLM_PROVIDER || "anthropic";

  if (provider === "anthropic") {
    return generateWithAnthropic(systemPrompt, userPrompt);
  } else {
    return generateWithOpenAI(systemPrompt, userPrompt);
  }
}

async function generateWithAnthropic(
  systemPrompt: string,
  userPrompt: string
): Promise<LLMResponse> {
  // SDK defaults: 2 retries on 408/429/5xx, 10-minute timeout.
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 16000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  return { text };
}

async function generateWithOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${err}`);
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content || "";
  return { text };
}
