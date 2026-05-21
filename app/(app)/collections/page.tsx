"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Baby,
  Briefcase,
  Heart,
  Lightbulb,
  Compass,
  Plus,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  is_default: boolean;
  created_at: string;
  recording_count: number;
}

const iconMap: Record<string, React.ReactNode> = {
  book: <BookOpen className="h-5 w-5" />,
  baby: <Baby className="h-5 w-5" />,
  briefcase: <Briefcase className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  lightbulb: <Lightbulb className="h-5 w-5" />,
  compass: <Compass className="h-5 w-5" />,
  folder: <FolderOpen className="h-5 w-5" />,
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCollections() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("collections")
      .select("id, name, description, icon, is_default, created_at, collection_recordings(count)")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    if (data) {
      const mapped = data.map((c) => ({
        ...c,
        recording_count: (c.collection_recordings as unknown as { count: number }[])?.[0]?.count || 0,
      }));
      setCollections(mapped as Collection[]);
    }
    setLoading(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("collections").insert({
      user_id: user.id,
      name: newName.trim(),
      description: newDesc.trim() || null,
      icon: "folder",
      is_default: false,
    });

    setNewName("");
    setNewDesc("");
    setCreating(false);
    setDialogOpen(false);
    loadCollections();
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
      <div className="flex items-start justify-between mb-10 gap-4">
        <div>
          <p className="label text-gold-dark mb-3">Organize</p>
          <h1 className="mb-2">Collections</h1>
          <p className="text-muted-foreground italic">
            Group recordings into stories and themes
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            className={buttonVariants({ className: "font-heading tracking-wide" })}
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading tracking-wide">
                Create Collection
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="font-medium text-foreground mb-2 block">
                  Name
                </label>
                <Input
                  placeholder='e.g. "Pool Hustling Tales"'
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <label className="font-medium text-foreground mb-2 block">
                  Description (optional)
                </label>
                <Input
                  placeholder="What kind of stories go here?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="w-full font-heading tracking-wide"
              >
                {creating ? "Creating..." : "Create Collection"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {collections.map((col) => (
          <Link key={col.id} href={`/collections/${col.id}`}>
            <div className="rounded-lg border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold/10 text-gold-dark flex-shrink-0">
                    {iconMap[col.icon] || iconMap.folder}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3>{col.name}</h3>
                    {col.description && (
                      <p className="text-muted-foreground truncate">
                        {col.description}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-1">
                      {col.recording_count} recording{col.recording_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
