export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          bio: string | null;
          accessibility_prefs: Json | null;
          subscription_tier: "free" | "storyteller" | "family_legacy" | "legacy_forever";
          onboarding_complete: boolean;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          bio?: string | null;
          accessibility_prefs?: Json | null;
          subscription_tier?: "free" | "storyteller" | "family_legacy" | "legacy_forever";
          onboarding_complete?: boolean;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          bio?: string | null;
          accessibility_prefs?: Json | null;
          subscription_tier?: "free" | "storyteller" | "family_legacy" | "legacy_forever";
          onboarding_complete?: boolean;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      recordings: {
        Row: {
          id: string;
          user_id: string;
          storage_path: string;
          duration_seconds: number;
          file_size_bytes: number;
          mime_type: string;
          transcription: string | null;
          transcription_meta: Json | null;
          status: "uploading" | "uploaded" | "transcribing" | "transcribed" | "failed";
          prompt_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          storage_path: string;
          duration_seconds: number;
          file_size_bytes: number;
          mime_type: string;
          transcription?: string | null;
          transcription_meta?: Json | null;
          status?: "uploading" | "uploaded" | "transcribing" | "transcribed" | "failed";
          prompt_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          storage_path?: string;
          duration_seconds?: number;
          file_size_bytes?: number;
          mime_type?: string;
          transcription?: string | null;
          transcription_meta?: Json | null;
          status?: "uploading" | "uploaded" | "transcribing" | "transcribed" | "failed";
          prompt_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          recording_id: string;
          user_id: string;
          title: string;
          written_content: string;
          summary: string;
          themes: string[];
          characters: Json;
          time_period: string | null;
          location: string | null;
          life_chapter: "childhood" | "youth" | "career" | "family" | "adventures" | "wisdom";
          podcast_script: string | null;
          podcast_audio_path: string | null;
          notebook_prompt: string | null;
          share_clip_path: string | null;
          visibility: "private" | "family" | "public";
          status: "generating" | "ready" | "failed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recording_id: string;
          user_id: string;
          title: string;
          written_content: string;
          summary: string;
          themes?: string[];
          characters?: Json;
          time_period?: string | null;
          location?: string | null;
          life_chapter?: "childhood" | "youth" | "career" | "family" | "adventures" | "wisdom";
          podcast_script?: string | null;
          podcast_audio_path?: string | null;
          notebook_prompt?: string | null;
          share_clip_path?: string | null;
          visibility?: "private" | "family" | "public";
          status?: "generating" | "ready" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          recording_id?: string;
          user_id?: string;
          title?: string;
          written_content?: string;
          summary?: string;
          themes?: string[];
          characters?: Json;
          time_period?: string | null;
          location?: string | null;
          life_chapter?: "childhood" | "youth" | "career" | "family" | "adventures" | "wisdom";
          podcast_script?: string | null;
          podcast_audio_path?: string | null;
          notebook_prompt?: string | null;
          share_clip_path?: string | null;
          visibility?: "private" | "family" | "public";
          status?: "generating" | "ready" | "failed";
          created_at?: string;
          updated_at?: string;
        };
      };
      family_groups: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          invite_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          invite_code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          invite_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      family_members: {
        Row: {
          family_group_id: string;
          user_id: string;
          role: "owner" | "storyteller" | "listener" | "heir";
          relationship: string | null;
          created_at: string;
        };
        Insert: {
          family_group_id: string;
          user_id: string;
          role?: "owner" | "storyteller" | "listener" | "heir";
          relationship?: string | null;
          created_at?: string;
        };
        Update: {
          family_group_id?: string;
          user_id?: string;
          role?: "owner" | "storyteller" | "listener" | "heir";
          relationship?: string | null;
          created_at?: string;
        };
      };
      designated_heirs: {
        Row: {
          id: string;
          owner_id: string;
          heir_email: string;
          heir_user_id: string | null;
          transfer_trigger: "inactivity" | "manual" | "date";
          inactivity_months: number;
          transfer_date: string | null;
          status: "pending" | "notified" | "transferred" | "revoked";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          heir_email: string;
          heir_user_id?: string | null;
          transfer_trigger?: "inactivity" | "manual" | "date";
          inactivity_months?: number;
          transfer_date?: string | null;
          status?: "pending" | "notified" | "transferred" | "revoked";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          heir_email?: string;
          heir_user_id?: string | null;
          transfer_trigger?: "inactivity" | "manual" | "date";
          inactivity_months?: number;
          transfer_date?: string | null;
          status?: "pending" | "notified" | "transferred" | "revoked";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      subscription_tier: "free" | "storyteller" | "family_legacy" | "legacy_forever";
      recording_status: "uploading" | "uploaded" | "transcribing" | "transcribed" | "failed";
      story_status: "generating" | "ready" | "failed";
      life_chapter: "childhood" | "youth" | "career" | "family" | "adventures" | "wisdom";
      visibility: "private" | "family" | "public";
      family_role: "owner" | "storyteller" | "listener" | "heir";
      transfer_trigger: "inactivity" | "manual" | "date";
      heir_status: "pending" | "notified" | "transferred" | "revoked";
    };
  };
};
