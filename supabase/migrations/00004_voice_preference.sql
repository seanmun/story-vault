ALTER TABLE profiles ADD COLUMN IF NOT EXISTS voice_preference text CHECK (voice_preference IN ('male', 'female'));
