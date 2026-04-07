export type LifeChapter = "childhood" | "youth" | "career" | "family" | "adventures" | "wisdom";
export type StoryVisibility = "private" | "family" | "public";
export type StoryStatus = "generating" | "ready" | "failed";

export interface StoryCharacter {
  name: string;
  relationship: string;
  mentions: number;
}

export interface Story {
  id: string;
  recordingId: string;
  userId: string;
  title: string;
  writtenContent: string;
  summary: string;
  themes: string[];
  characters: StoryCharacter[];
  timePeriod: string | null;
  location: string | null;
  lifeChapter: LifeChapter;
  podcastScript: string | null;
  podcastAudioPath: string | null;
  notebookPrompt: string | null;
  shareClipPath: string | null;
  visibility: StoryVisibility;
  status: StoryStatus;
  createdAt: string;
  updatedAt: string;
}
