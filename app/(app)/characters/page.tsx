"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CharacterPhoto {
  id: string;
  image_path: string;
  url?: string;
}

interface Character {
  id: string;
  name: string;
  role: string | null;
  physical_description: string | null;
  reference_image_path: string | null;
  photos: CharacterPhoto[];
}

function newPhotoPath(userId: string, characterId: string, ext: string): string {
  return `${userId}/characters/${characterId}/${Date.now()}.${ext}`;
}

export default function CharactersPage() {
  const supabase = useRef(createClient()).current;
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.assign("/login");
      return;
    }
    const { data } = await supabase
      .from("characters")
      .select("id, name, role, physical_description, reference_image_path, character_photos(id, image_path)")
      .order("created_at");
    const rows: Character[] = (data ?? []).map((c) => ({
      ...c,
      photos: (c.character_photos ?? []) as CharacterPhoto[],
    }));
    await Promise.all(
      rows.flatMap((c) =>
        c.photos.map(async (p) => {
          const { data: s } = await supabase.storage
            .from("recordings")
            .createSignedUrl(p.image_path, 3600);
          p.url = s?.signedUrl;
        })
      )
    );
    setCharacters(rows);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // load() is async — all setState happens after awaits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function addCharacter() {
    const name = newName.trim();
    if (!name) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("characters").insert({
      user_id: user.id,
      name,
      role: newRole.trim() || null,
    });
    if (error) {
      toast.error(
        error.message.includes("duplicate")
          ? `"${name}" already exists`
          : "Could not add character"
      );
      return;
    }
    setNewName("");
    setNewRole("");
    void load();
  }

  async function uploadPhoto(character: Character, file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setBusyId(character.id);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = newPhotoPath(user.id, character.id, ext);
    const { error: upErr } = await supabase.storage
      .from("recordings")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upErr) {
      toast.error("Upload failed: " + upErr.message);
      setBusyId(null);
      return;
    }
    await supabase
      .from("character_photos")
      .insert({ character_id: character.id, user_id: user.id, image_path: path });
    // New uploads become the active photo — tap another to switch back.
    const { error: rowErr } = await supabase
      .from("characters")
      .update({ reference_image_path: path })
      .eq("id", character.id);
    if (rowErr) toast.error("Could not save photo");
    else toast.success(`${character.name}: photo added and set active`);
    setBusyId(null);
    void load();
  }

  async function setActive(character: Character, photo: CharacterPhoto) {
    const { error } = await supabase
      .from("characters")
      .update({ reference_image_path: photo.image_path })
      .eq("id", character.id);
    if (error) toast.error("Could not switch photo");
    else toast.success(`${character.name}: films will use this photo`);
    void load();
  }

  async function removePhoto(character: Character, photo: CharacterPhoto) {
    await supabase.from("character_photos").delete().eq("id", photo.id);
    if (character.reference_image_path === photo.image_path) {
      const next = character.photos.find((p) => p.id !== photo.id);
      await supabase
        .from("characters")
        .update({ reference_image_path: next?.image_path ?? null })
        .eq("id", character.id);
    }
    void load();
  }

  async function saveDescription(character: Character, text: string) {
    const { error } = await supabase
      .from("characters")
      .update({ physical_description: text.trim() || null })
      .eq("id", character.id);
    if (error) toast.error("Could not save description");
    else toast.success("Saved");
  }

  async function remove(character: Character) {
    if (!window.confirm(`Remove ${character.name}? Their photo link is removed from future videos.`)) return;
    const { error } = await supabase.from("characters").delete().eq("id", character.id);
    if (error) toast.error("Could not remove");
    void load();
  }

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-muted-foreground italic">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <p className="label text-gold-dark mb-3">The Cast</p>
      <h1 className="mb-2">Characters</h1>
      <p className="text-muted-foreground mb-10 max-w-prose">
        The people in your stories. Add a photo and your story films will draw
        them true to life — without one, they appear as the illustrator
        imagines them.
      </p>

      <div className="space-y-4 mb-12">
        {characters.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-4">
              {c.photos.length === 0 && (
                <div className="flex h-20 w-20 items-center justify-center rounded-md bg-muted shrink-0">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-heading text-foreground font-semibold truncate">
                    {c.name}
                    {c.role && (
                      <span className="ml-2 font-normal text-muted-foreground capitalize">
                        {c.role}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => remove(c)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={`Remove ${c.name}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                {c.photos.length > 0 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {c.photos.map((p) => {
                      const active = c.reference_image_path === p.image_path;
                      return (
                        <div key={p.id} className="relative shrink-0">
                          <button
                            onClick={() => !active && setActive(c, p)}
                            className={`block rounded-md ${active ? "ring-2 ring-gold-dark" : "opacity-75 hover:opacity-100"}`}
                            aria-label={active ? "Active photo" : `Use this photo of ${c.name}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.url}
                              alt={`Photo of ${c.name}`}
                              className="h-20 w-20 rounded-md object-cover"
                            />
                          </button>
                          {active && (
                            <span className="absolute left-1 top-1 rounded bg-gold-dark/90 px-1.5 text-xs text-white">
                              in films
                            </span>
                          )}
                          <button
                            onClick={() => removePhoto(c, p)}
                            className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:text-destructive"
                            aria-label="Remove this photo"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <textarea
                  defaultValue={c.physical_description ?? ""}
                  onBlur={(e) => {
                    if (e.target.value !== (c.physical_description ?? "")) {
                      void saveDescription(c, e.target.value);
                    }
                  }}
                  placeholder="What do they look like? e.g. tall, wiry, slicked-back black hair, always in a leather jacket"
                  className="mt-2 w-full rounded-md border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground"
                  rows={2}
                  aria-label={`Description of ${c.name}`}
                />
                <label className="mt-3 inline-flex">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadPhoto(c, f);
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-border bg-background px-4 font-heading tracking-wide hover:bg-muted transition-colors">
                    {busyId === c.id ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5 mr-2" />
                    )}
                    Add Photo
                  </span>
                </label>
              </div>
            </div>
          </div>
        ))}
        {characters.length === 0 && (
          <p className="text-muted-foreground italic">
            No characters yet — they appear here automatically when a story
            film is made, or add someone below.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="font-medium text-foreground mb-4">Add someone</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name (e.g. Ronnie)"
            aria-label="Character name"
          />
          <Input
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="Who are they? (e.g. old rival)"
            aria-label="Character role"
          />
          <Button size="lg" onClick={addCharacter} className="font-heading tracking-wide shrink-0">
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
