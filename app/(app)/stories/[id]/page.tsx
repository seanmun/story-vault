"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Mic, Calendar, BookOpen, Sparkles, Volume2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Recording {
  id: string;
  duration_seconds: number;
  status: string;
  transcription: string | null;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
}

interface Story {
  id: string;
  title: string;
  written_content: string;
  summary: string;
  themes: string[];
  characters: { name: string; relationship: string; mentions: number }[];
  time_period: string | null;
  location: string | null;
  life_chapter: string;
  podcast_audio_path: string | null;
  status: string;
  created_at: string;
  recording_id: string;
}

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Try loading as a story first
      const { data: storyData } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (storyData) {
        setStory(storyData as Story);

        // Load associated recording
        const { data: recData } = await supabase
          .from("recordings")
          .select("*")
          .eq("id", storyData.recording_id)
          .single();
        if (recData) setRecording(recData as Recording);
      } else {
        // Try loading as a recording
        const { data: recData } = await supabase
          .from("recordings")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
        if (recData) setRecording(recData as Recording);
      }

      setLoading(false);
    }

    load();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="px-6 py-8">
        <p className="text-muted-foreground italic">Loading...</p>
      </div>
    );
  }

  if (!story && !recording) {
    return (
      <div className="px-6 py-8">
        <p className="text-muted-foreground">Not found.</p>
        <Button variant="outline" onClick={() => router.push("/stories")} className="mt-4">
          Back to Stories
        </Button>
      </div>
    );
  }

  // If we have a generated story, show the reading view
  if (story && story.status === "ready") {
    return <StoryReadingView story={story} recording={recording} onBack={() => router.push("/stories")} />;
  }

  // Otherwise show the recording view
  if (recording) {
    return <RecordingView recording={recording} story={story} onBack={() => router.push("/stories")} />;
  }

  return null;
}

function StoryReadingView({
  story,
  recording,
  onBack,
}: {
  story: Story;
  recording: Recording | null;
  onBack: () => void;
}) {
  const [showTranscription, setShowTranscription] = useState(false);
  const [audioGenerating, setAudioGenerating] = useState(false);
  const [audioPath, setAudioPath] = useState(story.podcast_audio_path);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const supabaseClient = createClient();
  const date = new Date(story.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const durationStr = recording
    ? recording.duration_seconds >= 60
      ? `${Math.floor(recording.duration_seconds / 60)}m ${recording.duration_seconds % 60}s`
      : `${recording.duration_seconds}s`
    : null;

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Stories
      </button>

      {/* Title */}
      <p className="label text-gold-dark mb-2">{story.life_chapter}</p>
      <h1 className="mb-4 leading-tight">{story.title}</h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formattedDate}
        </span>
        {durationStr && (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {durationStr} recording
          </span>
        )}
        {story.location && (
          <span className="text-muted-foreground">{story.location}</span>
        )}
        {story.time_period && (
          <span className="text-muted-foreground">{story.time_period}</span>
        )}
      </div>

      {/* Themes */}
      {story.themes?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {story.themes.map((theme) => (
            <span
              key={theme}
              className="text-gold-dark bg-gold/10 px-3 py-1 rounded"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Summary */}
      <p className="lead text-muted-foreground italic mb-8 border-l-2 border-gold/30 pl-4">
        {story.summary}
      </p>

      {/* Audio player / generate button */}
      <div className="mb-10 rounded-lg border border-border bg-card p-5">
        {audioPath ? (
          <div>
            <p className="label text-foreground mb-3 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gold-dark" />
              Listen
            </p>
            <audio
              controls
              src={`/api/stories/${story.id}/audio`}
              className="w-full"
              preload="none"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        ) : showVoicePicker ? (
          <div>
            <p className="font-medium text-foreground mb-2">
              How should we narrate your stories?
            </p>
            <p className="text-muted-foreground mb-4">
              Choose a voice for your audio narrations. You can change this later in settings.
            </p>
            <div className="flex gap-3">
              {(["male", "female"] as const).map((voice) => (
                <Button
                  key={voice}
                  variant="outline"
                  className="flex-1 font-heading tracking-wide capitalize"
                  disabled={audioGenerating}
                  onClick={async () => {
                    // Save preference
                    const { data: { user } } = await supabaseClient.auth.getUser();
                    if (user) {
                      await supabaseClient
                        .from("profiles")
                        .update({ voice_preference: voice })
                        .eq("id", user.id);
                    }
                    // Generate audio
                    setShowVoicePicker(false);
                    setAudioGenerating(true);
                    try {
                      const res = await fetch(`/api/stories/${story.id}/audio`, {
                        method: "POST",
                      });
                      const data = await res.json();
                      if (data.audioPath) {
                        setAudioPath(data.audioPath);
                        toast.success("Audio ready!");
                      } else {
                        toast.error(data.error || "Audio generation failed");
                      }
                    } catch {
                      toast.error("Audio generation failed");
                    }
                    setAudioGenerating(false);
                  }}
                >
                  {voice === "male" ? "Male Voice" : "Female Voice"}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                Listen to this story
              </p>
              <p className="text-muted-foreground">
                Generate an audio narration
              </p>
            </div>
            <Button
              onClick={async () => {
                // Check if voice preference is set
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (user) {
                  const { data: profile } = await supabaseClient
                    .from("profiles")
                    .select("voice_preference, elevenlabs_voice_id")
                    .eq("id", user.id)
                    .single();

                  if (profile?.elevenlabs_voice_id || profile?.voice_preference) {
                    // Already has a voice — generate directly
                    setAudioGenerating(true);
                    try {
                      const res = await fetch(`/api/stories/${story.id}/audio`, {
                        method: "POST",
                      });
                      const data = await res.json();
                      if (data.audioPath) {
                        setAudioPath(data.audioPath);
                        toast.success("Audio ready!");
                      } else {
                        toast.error(data.error || "Audio generation failed");
                      }
                    } catch {
                      toast.error("Audio generation failed");
                    }
                    setAudioGenerating(false);
                    return;
                  }
                }
                // No voice set — show picker
                setShowVoicePicker(true);
              }}
              disabled={audioGenerating}
              className="font-heading tracking-wide"
            >
              {audioGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Generate Audio
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Story content */}
      <div className="prose-custom">
        {story.written_content.split("\n").map((paragraph, i) => {
          if (!paragraph.trim()) return null;
          if (paragraph.startsWith("# ")) {
            return (
              <h2 key={i} className="mt-10 mb-4">
                {paragraph.replace(/^#+\s*/, "")}
              </h2>
            );
          }
          return (
            <p key={i} className="text-foreground mb-4">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Characters */}
      {story.characters && Array.isArray(story.characters) && story.characters.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <p className="label text-foreground mb-4">People in This Story</p>
          <div className="space-y-2">
            {(story.characters as { name: string; relationship: string; mentions: number }[]).map((char, i) => (
              <p key={i} className="text-muted-foreground">
                <span className="font-medium text-foreground">{char.name}</span>
                {char.relationship && ` — ${char.relationship}`}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Original Transcription */}
      {recording?.transcription && (
        <div className="mt-12 pt-8 border-t border-border">
          <button
            onClick={() => setShowTranscription(!showTranscription)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {showTranscription ? "Hide" : "View"} Original Transcription
          </button>
          {showTranscription && (
            <p className="mt-4 text-muted-foreground whitespace-pre-wrap">
              {recording.transcription}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RecordingView({
  recording,
  story,
  onBack,
}: {
  recording: Recording;
  story: Story | null;
  onBack: () => void;
}) {
  const date = new Date(recording.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const mins = Math.floor(recording.duration_seconds / 60);
  const secs = recording.duration_seconds % 60;
  const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  const fileSizeStr =
    recording.file_size_bytes > 1_000_000
      ? `${(recording.file_size_bytes / 1_000_000).toFixed(1)} MB`
      : `${(recording.file_size_bytes / 1_000).toFixed(0)} KB`;

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Stories
      </button>

      <p className="label text-gold-dark mb-2">Recording</p>
      <h1 className="mb-6">{formattedDate}</h1>

      <div className="flex flex-wrap gap-6 mb-8">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formattedTime}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          {durationStr}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Mic className="h-4 w-4" />
          {fileSizeStr}
        </span>
      </div>

      {/* Story generation status */}
      {story && story.status === "generating" && (
        <div className="flex items-center gap-3 text-gold-dark bg-gold/10 rounded-lg p-4 mb-8">
          <Sparkles className="h-5 w-5" />
          Generating your story...
        </div>
      )}

      {story && story.status === "failed" && (
        <div className="text-destructive bg-destructive/10 rounded-lg p-4 mb-8">
          Story generation failed. You can try recording again.
        </div>
      )}

      {/* Status */}
      <div className="mb-8">
        <p className="label text-foreground mb-1">Status</p>
        <p className="text-primary font-medium capitalize">{recording.status}</p>
      </div>

      {/* Transcription */}
      <div>
        <p className="label text-foreground mb-3">Transcription</p>
        {recording.transcription ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-foreground whitespace-pre-wrap">
              {recording.transcription}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground italic">
            {recording.status === "transcribing"
              ? "Transcription in progress..."
              : recording.status === "failed"
              ? "Transcription failed."
              : "No transcription available."}
          </p>
        )}
      </div>
    </div>
  );
}
