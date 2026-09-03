"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, X } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  character_id: string | null;
  characters: { id: string; name: string; physical_description: string | null } | null;
}

/** "You mentioned Ronnie — what did he look like?" Answers persist on the
 * character forever, improving every future film. */
export function QuestionCards({ storyId }: { storyId: string }) {
  const supabase = useRef(createClient()).current;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("story_questions")
      .select("id, question_text, character_id, characters(id, name, physical_description)")
      .eq("story_id", storyId)
      .eq("status", "pending")
      .order("created_at");
    setQuestions((data as unknown as Question[]) ?? []);
  }, [storyId, supabase]);

  useEffect(() => {
    // load() is async — setState happens after awaits only.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function answer(q: Question) {
    const text = (drafts[q.id] ?? "").trim();
    if (!text) return;
    const { error } = await supabase
      .from("story_questions")
      .update({ answer_text: text, status: "answered" })
      .eq("id", q.id);
    if (error) {
      toast.error("Could not save");
      return;
    }
    if (q.characters) {
      const merged = q.characters.physical_description
        ? `${q.characters.physical_description}. ${text}`
        : text;
      await supabase
        .from("characters")
        .update({ physical_description: merged })
        .eq("id", q.characters.id);
    }
    toast.success(
      q.characters
        ? `${q.characters.name} will look right in every film from now on`
        : "Saved"
    );
    void load();
  }

  async function dismiss(q: Question) {
    await supabase
      .from("story_questions")
      .update({ status: "dismissed" })
      .eq("id", q.id);
    void load();
  }

  if (questions.length === 0) return null;

  return (
    <div className="mb-10 rounded-lg border border-gold/40 bg-gold/5 p-5">
      <p className="label text-gold-dark mb-4 flex items-center gap-2">
        <HelpCircle className="h-4 w-4" />
        Help illustrate this story
      </p>
      <div className="space-y-5">
        {questions.map((q) => (
          <div key={q.id}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-foreground mb-2">{q.question_text}</p>
              <button
                onClick={() => dismiss(q)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss question"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={drafts[q.id] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && void answer(q)}
                placeholder="e.g. short and stocky, red beard, thick glasses"
                aria-label={q.question_text}
              />
              <Button
                size="lg"
                onClick={() => answer(q)}
                className="font-heading tracking-wide shrink-0"
              >
                Save
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
