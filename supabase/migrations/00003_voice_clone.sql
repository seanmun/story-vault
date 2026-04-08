-- Add voice clone fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS elevenlabs_voice_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS voice_clone_tier text CHECK (voice_clone_tier IN ('basic', 'enhanced'));
