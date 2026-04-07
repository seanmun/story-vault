export type RecordingStatus = "uploading" | "uploaded" | "transcribing" | "transcribed" | "failed";

export interface Recording {
  id: string;
  userId: string;
  storagePath: string;
  durationSeconds: number;
  fileSizeBytes: number;
  mimeType: string;
  transcription: string | null;
  transcriptionMeta: TranscriptionMeta | null;
  status: RecordingStatus;
  promptId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptionMeta {
  words: TranscriptionWord[];
  confidence: number;
  speakers: number;
}

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: number;
}
