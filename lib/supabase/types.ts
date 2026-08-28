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
          elevenlabs_voice_id: string | null;
          voice_clone_tier: "basic" | "enhanced" | null;
          voice_preference: "male" | "female" | null;
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
          elevenlabs_voice_id?: string | null;
          voice_clone_tier?: "basic" | "enhanced" | null;
          voice_preference?: "male" | "female" | null;
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
          elevenlabs_voice_id?: string | null;
          voice_clone_tier?: "basic" | "enhanced" | null;
          voice_preference?: "male" | "female" | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "recordings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "stories_recording_id_fkey";
            columns: ["recording_id"];
            isOneToOne: true;
            referencedRelation: "recordings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stories_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      collection_recordings: {
        Row: {
          collection_id: string;
          recording_id: string;
          position: number;
          added_at: string;
        };
        Insert: {
          collection_id: string;
          recording_id: string;
          position?: number;
          added_at?: string;
        };
        Update: {
          collection_id?: string;
          recording_id?: string;
          position?: number;
          added_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collection_recordings_collection_id_fkey";
            columns: ["collection_id"];
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_recordings_recording_id_fkey";
            columns: ["recording_id"];
            referencedRelation: "recordings";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "family_groups_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "family_members_family_group_id_fkey";
            columns: ["family_group_id"];
            referencedRelation: "family_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "family_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "designated_heirs_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "designated_heirs_heir_user_id_fkey";
            columns: ["heir_user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
