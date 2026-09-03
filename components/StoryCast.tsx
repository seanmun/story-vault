"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, Upload, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface RosterCharacter {
  id: string;
  name: string;
  aliases: string[];
  role: string | null;
  physical_description: string | null;
  reference_image_path: string | null;
  thumbUrl?: string | null;
}

interface CastEntry {
  storyName: string; // as this story refers to them ("my dad", "Jason")
  matched: RosterCharacter | null;
}

/** The people in THIS story, matched against the account-level cast.
 * Photos and descriptions edit the shared character, so every story
 * benefits; unmatched names get confirmed against existing characters
 * (saved as an alias) or created fresh. */
export function StoryCast({
  storyId,
  metadataCharacters,
}: {
  storyId: string;
  metadataCharacters: { name: string; relationship?: string }[];
}) {
  const supabase = useRef(createClient()).current;
  const [entries, setEntries] = useState<CastEntry[]>([]);
  const [roster, setRoster] = useState<RosterCharacter[]>([]);
  const [busyName, setBusyName] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);

  const norm = (s: string) => s.trim().toLowerCase();

  const load = useCallback(async () => {
    const { data: rosterRows } = await supabase
      .from("characters")
      .select("id, name, aliases, role, physical_description, reference_image_path")
      .order("name");
    const cast: RosterCharacter[] = rosterRows ?? [];
    await Promise.all(
      cast.map(async (c) => {
        if (c.reference_image_path) {
          const { data: s } = await supabase.storage
            .from("recordings")
            .createSignedUrl(c.reference_image_path, 3600);
          c.thumbUrl = s?.signedUrl ?? null;
        }
      })
    );

    // Names as this story uses them: scene analysis first, metadata fallback.
    const { data: scenes } = await supabase
      .from("story_scenes")
      .select("characters_present")
      .eq("story_id", storyId);
    const names = new Set<string>();
    for (const s of scenes ?? []) {
      for (const n of s.characters_present ?? []) names.add(n.trim());
    }
    if (names.size === 0) {
      for (const c of metadataCharacters) names.add(c.name.trim());
    }
    names.add("Narrator");

    const match = (name: string) =>
      cast.find(
        (c) =>
          norm(c.name) === norm(name) ||
          c.aliases.some((a) => norm(a) === norm(name)) ||
          (/narrator/i.test(name) && c.name === "Narrator")
      ) ?? null;

    const list = [...names]
      .filter((n) => n.length > 1)
      .map((storyName) => ({ storyName, matched: match(storyName) }));
    // Narrator first, then matched, then unconfirmed
    list.sort((a, b) => {
      const rank = (e: CastEntry) =>
        /narrator/i.test(e.storyName) ? 0 : e.matched ? 1 : 2;
      return rank(a) - rank(b) || a.storyName.localeCompare(b.storyName);
    });
    setRoster(cast);
    setEntries(list);
  }, [metadataCharacters, storyId, supabase]);

  useEffect(() => {
    // load() is async — setState happens after awaits only.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function uploadPhoto(character: RosterCharacter, file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setBusyName(character.name);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = `${user.id}/characters/${character.id}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("recordings")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upErr) {
      toast.error("Upload failed: " + upErr.message);
      setBusyName(null);
      return;
    }
    await supabase
      .from("characters")
      .update({ reference_image_path: path })
      .eq("id", character.id);
    toast.success(`${character.name} now has a face — remake the film below to apply`);
    setBusyName(null);
    setChanged(true);
    void load();
  }

  async function linkAlias(storyName: string, characterId: string) {
    const target = roster.find((c) => c.id === characterId);
    if (!target) return;
    const aliases = [...new Set([...target.aliases, storyName])];
    const { error } = await supabase
      .from("characters")
      .update({ aliases })
      .eq("id", characterId);
    if (error) toast.error("Could not link");
    else {
      toast.success(`"${storyName}" is ${target.name}`);
      setChanged(true);
    }
    void load();
  }

  async function createNew(storyName: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("characters").insert({
      user_id: user.id,
      name: storyName,
    });
    if (error) toast.error("Could not add");
    void load();
  }

  if (entries.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-1">
        <p className="label text-foreground">People in This Story</p>
        <Link href="/characters" className="text-gold-dark hover:underline">
          Full cast
        </Link>
      </div>
      <p className="text-muted-foreground mb-5">
        Photos and details are remembered across all your stories.
      </p>
      <div className="space-y-3">
        {entries.map((e) => (
          <div
            key={e.storyName}
            className="rounded-lg border border-border bg-card p-4"
          >
            {e.matched ? (
              <div className="flex items-center gap-4">
                {e.matched.thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.matched.thumbUrl}
                    alt={`Photo of ${e.matched.name}`}
                    className="h-14 w-14 rounded-md object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted shrink-0">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">
                    {/narrator/i.test(e.storyName) ? "You (the storyteller)" : e.storyName}
                    {e.matched.name !== e.storyName &&
                      !/narrator/i.test(e.storyName) && (
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          <Check className="inline h-4 w-4 text-gold-dark" /> {e.matched.name}
                        </span>
                      )}
                  </p>
                  {e.matched.physical_description && (
                    <p className="text-muted-foreground truncate">
                      {e.matched.physical_description}
                    </p>
                  )}
                </div>
                <label className="shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(ev) => {
                      const f = ev.target.files?.[0];
                      if (f) void uploadPhoto(e.matched!, f);
                      ev.target.value = "";
                    }}
                  />
                  <span className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-border bg-background px-4 font-heading tracking-wide hover:bg-muted transition-colors">
                    {busyName === e.matched.name ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2" />
                        {e.matched.reference_image_path ? "Replace" : "Add Photo"}
                      </>
                    )}
                  </span>
                </label>
              </div>
            ) : (
              <div>
                <p className="font-medium text-foreground mb-2">
                  &ldquo;{e.storyName}&rdquo; — is this someone already in your cast?
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    defaultValue=""
                    onChange={(ev) => {
                      if (ev.target.value) void linkAlias(e.storyName, ev.target.value);
                    }}
                    className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-foreground"
                    aria-label={`Match ${e.storyName} to an existing character`}
                  >
                    <option value="" disabled>
                      Choose existing character...
                    </option>
                    {roster.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.role ? ` (${c.role})` : ""}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => createNew(e.storyName)}
                    className="font-heading tracking-wide shrink-0"
                  >
                    Someone new
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {changed && (
        <p className="text-gold-dark mt-4">
          Changes saved. Use &ldquo;Remake with updated characters&rdquo; on the
          film above to redraw it with these faces.
        </p>
      )}
    </div>
  );
}
