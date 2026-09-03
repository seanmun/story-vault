-- Video pipeline schema (Phase 5, spec §3)
-- characters: user-scoped, reused across stories (Ronnie described once)
-- story_scenes: the cut list with timestamps + generated images
-- story_videos: rendered outputs, versioned for future re-renders
-- story_questions: character-enrichment queue (Phase 6 consumes this)

CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  aliases text[] DEFAULT '{}',
  role text,
  physical_description text,
  era_notes text,
  reference_image_path text,
  locked_seed integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS story_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  index integer NOT NULL,
  start_ms integer NOT NULL,
  end_ms integer NOT NULL,
  setting text,
  beat text,
  characters_present text[] DEFAULT '{}',
  image_prompt text,
  image_path text,
  seed integer,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'generating', 'done', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (story_id, index)
);

CREATE TABLE IF NOT EXISTS story_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  video_path text,
  thumbnail_path text,
  watermark_variant text DEFAULT 'standard',
  duration_ms integer,
  render_version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'rendering'
    CHECK (status IN ('rendering', 'ready', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (story_id, render_version)
);

CREATE TABLE IF NOT EXISTS story_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  character_id uuid REFERENCES characters(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  answer_text text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'answered', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_characters_user ON characters (user_id);
CREATE INDEX IF NOT EXISTS idx_story_scenes_story ON story_scenes (story_id);
CREATE INDEX IF NOT EXISTS idx_story_videos_story ON story_videos (story_id);
CREATE INDEX IF NOT EXISTS idx_story_questions_user_status
  ON story_questions (user_id, status);

-- updated_at triggers (function exists from 00001)
DO $$ BEGIN
  CREATE TRIGGER characters_updated_at BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER story_scenes_updated_at BEFORE UPDATE ON story_scenes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER story_videos_updated_at BEFORE UPDATE ON story_videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER story_questions_updated_at BEFORE UPDATE ON story_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS: owner-only, scenes/videos scoped through the owning story
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own characters" ON characters;
CREATE POLICY "Users manage own characters" ON characters
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own story scenes" ON story_scenes;
CREATE POLICY "Users view own story scenes" ON story_scenes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stories WHERE id = story_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users view own story videos" ON story_videos;
CREATE POLICY "Users view own story videos" ON story_videos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stories WHERE id = story_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users manage own story questions" ON story_questions;
CREATE POLICY "Users manage own story questions" ON story_questions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Writes to scenes/videos happen only via the service-role pipeline; no
-- client INSERT/UPDATE policies on purpose.

SELECT 'video pipeline tables ready' AS result;
