-- StoryVault Initial Schema
-- Creates all core tables, enums, RLS policies, and triggers

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE subscription_tier AS ENUM ('free', 'storyteller', 'family_legacy', 'legacy_forever');
CREATE TYPE recording_status AS ENUM ('uploading', 'uploaded', 'transcribing', 'transcribed', 'failed');
CREATE TYPE story_status AS ENUM ('generating', 'ready', 'failed');
CREATE TYPE life_chapter AS ENUM ('childhood', 'youth', 'career', 'family', 'adventures', 'wisdom');
CREATE TYPE visibility AS ENUM ('private', 'family', 'public');
CREATE TYPE family_role AS ENUM ('owner', 'storyteller', 'listener', 'heir');
CREATE TYPE transfer_trigger AS ENUM ('inactivity', 'manual', 'date');
CREATE TYPE heir_status AS ENUM ('pending', 'notified', 'transferred', 'revoked');

-- ============================================================
-- TABLES
-- ============================================================

-- profiles: extends auth.users
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  date_of_birth date,
  bio text,
  accessibility_prefs jsonb DEFAULT '{"fontSize": 18, "highContrast": false, "reducedMotion": false}'::jsonb,
  subscription_tier subscription_tier DEFAULT 'free',
  onboarding_complete boolean DEFAULT false,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- recordings: raw audio files
CREATE TABLE recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 0,
  file_size_bytes bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT 'audio/webm',
  transcription text,
  transcription_meta jsonb,
  status recording_status DEFAULT 'uploading',
  prompt_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- stories: AI-generated story content
CREATE TABLE stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  written_content text NOT NULL,
  summary text NOT NULL,
  themes text[] DEFAULT '{}',
  characters jsonb DEFAULT '[]'::jsonb,
  time_period text,
  location text,
  life_chapter life_chapter DEFAULT 'wisdom',
  podcast_script text,
  podcast_audio_path text,
  notebook_prompt text,
  share_clip_path text,
  visibility visibility DEFAULT 'private',
  status story_status DEFAULT 'generating',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Full-text search on stories
ALTER TABLE stories ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(written_content, '')), 'C')
  ) STORED;

CREATE INDEX idx_stories_search ON stories USING GIN (search_vector);
CREATE INDEX idx_stories_user_chapter ON stories (user_id, life_chapter);
CREATE INDEX idx_stories_themes ON stories USING GIN (themes);

-- family_groups
CREATE TABLE family_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code text UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- family_members
CREATE TABLE family_members (
  family_group_id uuid NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role family_role DEFAULT 'listener',
  relationship text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (family_group_id, user_id)
);

-- designated_heirs
CREATE TABLE designated_heirs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  heir_email text NOT NULL,
  heir_user_id uuid REFERENCES profiles(id),
  transfer_trigger transfer_trigger DEFAULT 'inactivity',
  inactivity_months integer DEFAULT 24,
  transfer_date timestamptz,
  status heir_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_recordings_user ON recordings (user_id);
CREATE INDEX idx_recordings_status ON recordings (status);
CREATE INDEX idx_stories_user ON stories (user_id);
CREATE INDEX idx_stories_recording ON stories (recording_id);
CREATE INDEX idx_family_members_user ON family_members (user_id);
CREATE INDEX idx_designated_heirs_owner ON designated_heirs (owner_id);
CREATE INDEX idx_designated_heirs_email ON designated_heirs (heir_email);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER recordings_updated_at BEFORE UPDATE ON recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER family_groups_updated_at BEFORE UPDATE ON family_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER designated_heirs_updated_at BEFORE UPDATE ON designated_heirs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE designated_heirs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Recordings: users can CRUD their own recordings
CREATE POLICY "Users can view own recordings"
  ON recordings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recordings"
  ON recordings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recordings"
  ON recordings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recordings"
  ON recordings FOR DELETE USING (auth.uid() = user_id);

-- Stories: users can CRUD own, family can read shared
CREATE POLICY "Users can view own stories"
  ON stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Family can view shared stories"
  ON stories FOR SELECT USING (
    visibility = 'family' AND
    EXISTS (
      SELECT 1 FROM family_members fm1
      JOIN family_members fm2 ON fm1.family_group_id = fm2.family_group_id
      WHERE fm1.user_id = stories.user_id AND fm2.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own stories"
  ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories"
  ON stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE USING (auth.uid() = user_id);

-- Family groups: owner and members can view
CREATE POLICY "Members can view family group"
  ON family_groups FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM family_members WHERE family_group_id = id AND user_id = auth.uid())
  );
CREATE POLICY "Owner can insert family group"
  ON family_groups FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner can update family group"
  ON family_groups FOR UPDATE USING (auth.uid() = owner_id);

-- Family members: members can view their group
CREATE POLICY "Members can view group members"
  ON family_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_group_id = family_group_id AND fm.user_id = auth.uid())
  );
CREATE POLICY "Owner can manage members"
  ON family_members FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM family_groups WHERE id = family_group_id AND owner_id = auth.uid())
    OR auth.uid() = user_id
  );

-- Designated heirs: owner can manage
CREATE POLICY "Owner can view heirs"
  ON designated_heirs FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owner can insert heirs"
  ON designated_heirs FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner can update heirs"
  ON designated_heirs FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owner can delete heirs"
  ON designated_heirs FOR DELETE USING (auth.uid() = owner_id);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', false);

CREATE POLICY "Users can upload recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own recordings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own recordings"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);
