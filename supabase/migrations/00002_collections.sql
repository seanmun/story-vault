-- Collections: groups of recordings for combined narratives
-- Many-to-many: one recording can belong to multiple collections

CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text DEFAULT 'book',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE collection_recordings (
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  recording_id uuid NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  position integer DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (collection_id, recording_id)
);

-- Indexes
CREATE INDEX idx_collections_user ON collections (user_id);
CREATE INDEX idx_collection_recordings_recording ON collection_recordings (recording_id);
CREATE INDEX idx_collection_recordings_collection ON collection_recordings (collection_id);

-- Updated_at trigger
CREATE TRIGGER collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collections"
  ON collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collections"
  ON collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections"
  ON collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections"
  ON collections FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own collection recordings"
  ON collection_recordings FOR SELECT USING (
    EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can add to own collections"
  ON collection_recordings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can remove from own collections"
  ON collection_recordings FOR DELETE USING (
    EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND user_id = auth.uid())
  );

-- Auto-create default collections on signup
CREATE OR REPLACE FUNCTION create_default_collections()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.collections (user_id, name, description, icon, is_default) VALUES
    (NEW.id, 'Full Biography', 'Your complete life story', 'book', true),
    (NEW.id, 'Early Life', 'Childhood and growing up', 'baby', true),
    (NEW.id, 'Career & Work', 'Professional life and work stories', 'briefcase', true),
    (NEW.id, 'Family & Friends', 'Stories about the people who matter most', 'heart', true),
    (NEW.id, 'Life Lessons', 'Wisdom and lessons learned along the way', 'lightbulb', true),
    (NEW.id, 'Adventures & Travel', 'Travels, adventures, and wild times', 'compass', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created_collections
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_collections();
