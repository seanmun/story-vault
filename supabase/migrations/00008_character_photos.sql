-- Multiple reference photos per character (spec §Stage 4: photos spanning
-- eras). characters.reference_image_path remains the ACTIVE photo the
-- pipeline uses; this table holds the full collection.

CREATE TABLE IF NOT EXISTS character_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_path text NOT NULL,
  era_label text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_character_photos_character
  ON character_photos (character_id);

ALTER TABLE character_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own character photos" ON character_photos;
CREATE POLICY "Users manage own character photos" ON character_photos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Backfill: existing single reference photos become collection entries
INSERT INTO character_photos (character_id, user_id, image_path)
SELECT c.id, c.user_id, c.reference_image_path
FROM characters c
WHERE c.reference_image_path IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM character_photos p
    WHERE p.character_id = c.id AND p.image_path = c.reference_image_path
  );

SELECT 'character photos ready' AS result;
