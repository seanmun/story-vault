"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Film, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface VideoRow {
  status: "rendering" | "ready" | "failed";
  video_path: string | null;
  thumbnail_path: string | null;
}

interface SceneThumb {
  index: number;
  url: string;
}

type VideoState =
  | { kind: "loading" }
  | { kind: "none" }
  | { kind: "rendering"; progress: string }
  | { kind: "ready"; url: string; poster: string | null; thumbs: SceneThumb[] }
  | { kind: "failed" };

export function StoryVideo({ storyId }: { storyId: string }) {
  const [state, setState] = useState<VideoState>({ kind: "loading" });
  const supabase = useRef(createClient()).current;

  const refresh = useCallback(async () => {
    const { data: video } = await supabase
      .from("story_videos")
      .select("status, video_path, thumbnail_path")
      .eq("story_id", storyId)
      .order("render_version", { ascending: false })
      .limit(1)
      .maybeSingle<VideoRow>();

    if (!video) {
      setState({ kind: "none" });
      return;
    }
    if (video.status === "failed") {
      setState({ kind: "failed" });
      return;
    }
    if (video.status === "rendering") {
      const { data: scenes } = await supabase
        .from("story_scenes")
        .select("status")
        .eq("story_id", storyId);
      let progress = "Reading the story...";
      if (scenes?.length) {
        const done = scenes.filter((s) => s.status === "done").length;
        progress =
          done < scenes.length
            ? `Illustrating scene ${Math.min(done + 1, scenes.length)} of ${scenes.length}...`
            : "Weaving the film together...";
      }
      setState({ kind: "rendering", progress });
      return;
    }
    if (video.video_path) {
      const { data: signed } = await supabase.storage
        .from("recordings")
        .createSignedUrl(video.video_path, 3600);
      let poster: string | null = null;
      if (video.thumbnail_path) {
        const { data: t } = await supabase.storage
          .from("recordings")
          .createSignedUrl(video.thumbnail_path, 3600);
        poster = t?.signedUrl ?? null;
      }
      const { data: sceneRows } = await supabase
        .from("story_scenes")
        .select("index, image_path")
        .eq("story_id", storyId)
        .order("index");
      const thumbs: SceneThumb[] = [];
      for (const s of sceneRows ?? []) {
        if (!s.image_path) continue;
        const { data: t } = await supabase.storage
          .from("recordings")
          .createSignedUrl(s.image_path, 3600);
        if (t?.signedUrl) thumbs.push({ index: s.index, url: t.signedUrl });
      }
      if (signed?.signedUrl) {
        setState({ kind: "ready", url: signed.signedUrl, poster, thumbs });
        return;
      }
    }
    setState({ kind: "none" });
  }, [storyId, supabase]);

  useEffect(() => {
    // refresh() is async — all setState happens after network awaits, never
    // synchronously in the effect body; the rule can't see the call graph.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  // Poll while rendering so the progress line moves on its own.
  useEffect(() => {
    if (state.kind !== "rendering") return;
    const t = setInterval(() => void refresh(), 8000);
    return () => clearInterval(t);
  }, [state.kind, refresh]);

  async function rework(body: { sceneIndex?: number; all?: boolean }) {
    if (
      body.all &&
      !window.confirm(
        "Redraw every scene with the current character photos and descriptions, then re-render the film? Costs about a dollar."
      )
    ) {
      return;
    }
    setState({ kind: "rendering", progress: "Starting..." });
    const res = await fetch(`/api/stories/${storyId}/video/reroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Could not start");
      void refresh();
      return;
    }
    void refresh();
  }

  async function start() {
    setState({ kind: "rendering", progress: "Starting..." });
    const res = await fetch(`/api/stories/${storyId}/video`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Could not start the video");
      setState(data.error?.includes("re-transcribe") ? { kind: "none" } : { kind: "failed" });
      return;
    }
    void refresh();
  }

  if (state.kind === "loading") return null;

  return (
    <div className="mb-10 rounded-lg border border-border bg-card p-5">
      {state.kind === "ready" ? (
        <div>
          <p className="label text-foreground mb-3 flex items-center gap-2">
            <Film className="h-4 w-4 text-gold-dark" />
            Watch
          </p>
          <video
            controls
            src={state.url}
            poster={state.poster ?? undefined}
            className="w-full rounded-md"
            preload="metadata"
          >
            Your browser does not support video playback.
          </video>
          {state.thumbs.length > 0 && (
            <div className="mt-4">
              <p className="text-muted-foreground mb-2">
                The scenes — tap ↺ on any you&rsquo;d like drawn differently
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {state.thumbs.map((t) => (
                  <div key={t.index} className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.url}
                      alt={`Scene ${t.index + 1}`}
                      className="h-24 w-[170px] rounded-md object-cover"
                    />
                    <button
                      onClick={() => rework({ sceneIndex: t.index })}
                      className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-md bg-black/55 text-white hover:bg-black/75 transition-colors"
                      aria-label={`Redraw scene ${t.index + 1}`}
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="lg"
                className="mt-3 font-heading tracking-wide"
                onClick={() => rework({ all: true })}
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Remake with updated characters
              </Button>
            </div>
          )}
        </div>
      ) : state.kind === "rendering" ? (
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-gold-dark shrink-0" />
          <div>
            <p className="font-medium text-foreground">Making your story film</p>
            <p className="text-muted-foreground" aria-live="polite">
              {state.progress} This takes a few minutes — you can leave and come back.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <p className="font-medium text-foreground mb-1">
            {state.kind === "failed"
              ? "The film hit a snag."
              : "Turn this story into a film"}
          </p>
          <p className="text-muted-foreground mb-4">
            {state.kind === "failed"
              ? "Your story is safe — try again and it picks up where it left off."
              : "Illustrated scenes, set to the original recording."}
          </p>
          <Button size="lg" onClick={start} className="font-heading tracking-wide">
            <Film className="h-5 w-5 mr-2" />
            {state.kind === "failed" ? "Try Again" : "Create Video"}
          </Button>
        </div>
      )}
    </div>
  );
}
