-- Pipeline foundation (Phase 3)
-- 1. One story per recording: the app assumes it (stories[0] everywhere), and
--    the unique index makes retries/double-clicks idempotent instead of billing
--    duplicate LLM runs.
-- 2. Composite indexes for the two hottest queries the app actually runs.

-- ============================================================
-- 1. ONE STORY PER RECORDING
-- ============================================================

-- Remove any duplicates first: keep the best story per recording
-- (prefer ready, then newest).
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY recording_id
           ORDER BY (status = 'ready') DESC NULLS LAST, created_at DESC
         ) AS rn
  FROM stories
)
DELETE FROM stories WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS stories_recording_id_key
  ON stories (recording_id);

-- ============================================================
-- 2. QUERY-SHAPED INDEXES
-- ============================================================

-- Stories library: WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_recordings_user_created
  ON recordings (user_id, created_at DESC);

-- Voice clone sample selection: WHERE user_id = ? AND status = 'transcribed'
-- ORDER BY duration_seconds DESC
CREATE INDEX IF NOT EXISTS idx_recordings_user_status_duration
  ON recordings (user_id, status, duration_seconds DESC);
