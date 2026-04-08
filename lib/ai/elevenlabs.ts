const BASE_URL = "https://api.elevenlabs.io/v1";

// Default stock voice — "Rachel" is warm and clear, good for storytelling
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY not configured");
  return key;
}

/**
 * Generate speech from text using ElevenLabs TTS
 * Returns audio as a Buffer (mp3)
 */
export async function generateSpeech(
  text: string,
  voiceId?: string | null
): Promise<Buffer> {
  const apiKey = getApiKey();
  const voice = voiceId || DEFAULT_VOICE_ID;

  const response = await fetch(`${BASE_URL}/text-to-speech/${voice}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs TTS error ${response.status}: ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Create an instant voice clone from audio samples
 * Returns the new voice ID
 */
export async function createVoiceClone(
  name: string,
  audioFiles: { buffer: Buffer; filename: string }[]
): Promise<string> {
  const apiKey = getApiKey();

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", `StoryVault voice clone for ${name}`);

  for (const file of audioFiles) {
    const blob = new Blob([new Uint8Array(file.buffer)], { type: "audio/webm" });
    formData.append("files", blob, file.filename);
  }

  const response = await fetch(`${BASE_URL}/voices/add`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs clone error ${response.status}: ${err}`);
  }

  const result = await response.json();
  return result.voice_id;
}

/**
 * Delete a voice clone
 */
export async function deleteVoiceClone(voiceId: string): Promise<void> {
  const apiKey = getApiKey();

  const response = await fetch(`${BASE_URL}/voices/${voiceId}`, {
    method: "DELETE",
    headers: {
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs delete error ${response.status}: ${err}`);
  }
}
