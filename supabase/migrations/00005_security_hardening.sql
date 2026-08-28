-- Security hardening (Phase 1)
-- 1. Fix family_members RLS: self-referential SELECT policy recursed (42P17)
--    and its unqualified column made the predicate a tautology; INSERT policy
--    let any user add themselves to any group.
-- 2. Restrict which profile columns the browser (authenticated role) may update
--    so subscription_tier cannot be self-served.
-- 3. designated_heirs.heir_user_id blocked account deletion (no ON DELETE).
-- 4. Storage: add the missing UPDATE policy (audio upsert relies on it) and
--    set bucket size/MIME limits.
-- 5. Pin search_path on handle_new_user (Supabase linter: function_search_path_mutable).
-- 6. CHECK constraints on client-reported recording quantities.

-- ============================================================
-- 1. FAMILY RLS
-- ============================================================

-- SECURITY DEFINER helpers break the policy recursion cycle:
-- family_groups' policy referenced family_members and vice versa.
CREATE OR REPLACE FUNCTION public.is_family_group_owner(gid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_groups WHERE id = gid AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_family_group_member(gid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members WHERE family_group_id = gid AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_family_group_owner(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_family_group_member(uuid) FROM anon;

DROP POLICY IF EXISTS "Members can view group members" ON family_members;
CREATE POLICY "Members can view group members"
  ON family_members FOR SELECT USING (
    user_id = auth.uid()
    OR is_family_group_member(family_group_id)
    OR is_family_group_owner(family_group_id)
  );

-- Only the group owner may add members. Invite-code redemption, when built,
-- will go through a SECURITY DEFINER function that validates the code.
DROP POLICY IF EXISTS "Owner can manage members" ON family_members;
CREATE POLICY "Owner can add members"
  ON family_members FOR INSERT WITH CHECK (
    is_family_group_owner(family_group_id)
  );

-- Owner can evict; a member can leave.
DROP POLICY IF EXISTS "Owner or self can remove members" ON family_members;
CREATE POLICY "Owner or self can remove members"
  ON family_members FOR DELETE USING (
    user_id = auth.uid() OR is_family_group_owner(family_group_id)
  );

DROP POLICY IF EXISTS "Owner can update members" ON family_members;
CREATE POLICY "Owner can update members"
  ON family_members FOR UPDATE USING (
    is_family_group_owner(family_group_id)
  );

-- Rewrite the group SELECT policy through the helper so it no longer
-- references family_members directly (the other half of the recursion cycle).
DROP POLICY IF EXISTS "Members can view family group" ON family_groups;
CREATE POLICY "Members can view family group"
  ON family_groups FOR SELECT USING (
    owner_id = auth.uid() OR is_family_group_member(id)
  );

-- ============================================================
-- 2. PROFILES: COLUMN-LEVEL UPDATE PRIVILEGES
-- ============================================================

REVOKE UPDATE ON public.profiles FROM anon;
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (
  display_name,
  avatar_url,
  date_of_birth,
  bio,
  accessibility_prefs,
  onboarding_complete,
  voice_preference,
  elevenlabs_voice_id,
  voice_clone_tier
) ON public.profiles TO authenticated;
-- Deliberately excluded: subscription_tier, last_active_at, created_at,
-- updated_at, id. subscription_tier moves behind a service-role client when
-- billing lands; voice columns stay client-writable only because the voice
-- routes currently write through the user-scoped client (feature frozen).

-- ============================================================
-- 3. DESIGNATED HEIRS FK
-- ============================================================

ALTER TABLE designated_heirs
  DROP CONSTRAINT IF EXISTS designated_heirs_heir_user_id_fkey;
ALTER TABLE designated_heirs
  ADD CONSTRAINT designated_heirs_heir_user_id_fkey
  FOREIGN KEY (heir_user_id) REFERENCES profiles(id) ON DELETE SET NULL;
-- SET NULL, not CASCADE: the designation (with heir_email) should survive the
-- heir deleting their account; only the resolved user link is cleared.

-- ============================================================
-- 4. STORAGE
-- ============================================================

DROP POLICY IF EXISTS "Users can update own recordings" ON storage.objects;
CREATE POLICY "Users can update own recordings"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

UPDATE storage.buckets
SET
  file_size_limit = 52428800, -- 50 MB; a 10-min opus/AAC recording is well under this
  allowed_mime_types = ARRAY[
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/x-m4a',
    'audio/aac'
  ]
WHERE id = 'recordings';

-- ============================================================
-- 5. FUNCTION SEARCH PATH
-- ============================================================

ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- ============================================================
-- 6. RECORDING QUANTITY CONSTRAINTS
-- ============================================================

ALTER TABLE recordings
  DROP CONSTRAINT IF EXISTS recordings_duration_seconds_check;
ALTER TABLE recordings
  ADD CONSTRAINT recordings_duration_seconds_check
  CHECK (duration_seconds >= 0 AND duration_seconds <= 7200);
ALTER TABLE recordings
  DROP CONSTRAINT IF EXISTS recordings_file_size_bytes_check;
ALTER TABLE recordings
  ADD CONSTRAINT recordings_file_size_bytes_check
  CHECK (file_size_bytes >= 0 AND file_size_bytes <= 52428800);
