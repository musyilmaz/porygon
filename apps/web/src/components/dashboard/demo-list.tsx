"use client";

import type { DemoWithStats } from "@porygon/services";
import { Button } from "@porygon/ui/components/button";
import { Input } from "@porygon/ui/components/input";
import { toast } from "@porygon/ui/components/sonner";
import {
  Grid2X2,
  LayoutList,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DeleteDemoDialog } from "@/components/dashboard/delete-demo-dialog";
import { DemoCard } from "@/components/dashboard/demo-card";
import { DemoEmptyState } from "@/components/dashboard/demo-empty-state";
import { apiError, fetchOpts } from "@/lib/editor/api-utils";

type StatusFilter = "all" | "draft" | "published";
type ViewMode = "grid" | "list";

interface DemoListProps {
  initialDemos: DemoWithStats[];
  workspaceId: string;
}

export function DemoList({ initialDemos, workspaceId }: DemoListProps) {
  const router = useRouter();
  const [demos, setDemos] = useState(initialDemos);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [deletingDemo, setDeletingDemo] = useState<DemoWithStats | null>(null);

  const filtered = useMemo(() => {
    let result = demos;
    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((d) => d.title.toLowerCase().includes(q));
    }
    return result;
  }, [demos, statusFilter, search]);

  const statusCounts = useMemo(() => {
    const counts = { all: demos.length, draft: 0, published: 0 };
    for (const d of demos) {
      if (d.status === "draft") counts.draft++;
      if (d.status === "published") counts.published++;
    }
    return counts;
  }, [demos]);

  async function handleCreate() {
    try {
      const res = await fetch("/api/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, title: "Untitled demo" }),
        ...fetchOpts,
      });
      if (!res.ok) {
        toast.error(await apiError(res));
        return;
      }
      const demo = await res.json();
      router.push(`/editor/${demo.id}`);
    } catch {
      toast.error("Failed to create demo");
    }
  }

  async function handleDelete(id: string) {
    const prev = demos;
    setDemos((d) => d.filter((x) => x.id !== id));
    setDeletingDemo(null);

    try {
      const res = await fetch(`/api/demos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
        ...fetchOpts,
      });
      if (!res.ok) {
        setDemos(prev);
        toast.error(await apiError(res));
        return;
      }
      toast.success("Demo deleted");
    } catch {
      setDemos(prev);
      toast.error("Failed to delete demo");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const res = await fetch(`/api/demos/${id}/duplicate`, {
        method: "POST",
        ...fetchOpts,
      });
      if (!res.ok) {
        toast.error(await apiError(res));
        return;
      }
      const demo = await res.json();
      setDemos((d) => [
        { ...demo, stepCount: 0, totalViews: 0, thumbnailUrl: null },
        ...d,
      ]);
      toast.success("Demo duplicated", {
        action: {
          label: "Go to editor",
          onClick: () => router.push(`/editor/${demo.id}`),
        },
      });
    } catch {
      toast.error("Failed to duplicate demo");
    }
  }

  async function handlePublish(demo: DemoWithStats) {
    const prev = demos;
    setDemos((d) =>
      d.map((x) => (x.id === demo.id ? { ...x, status: "published" } : x)),
    );

    try {
      const res = await fetch(`/api/demos/${demo.id}/publish`, {
        method: "POST",
        ...fetchOpts,
      });
      if (!res.ok) {
        setDemos(prev);
        toast.error(await apiError(res));
        return;
      }
      toast.success("Demo published");
    } catch {
      setDemos(prev);
      toast.error("Failed to publish demo");
    }
  }

  async function handleUnpublish(demo: DemoWithStats) {
    const prev = demos;
    setDemos((d) =>
      d.map((x) => (x.id === demo.id ? { ...x, status: "draft" } : x)),
    );

    try {
      const res = await fetch(`/api/demos/${demo.id}/unpublish`, {
        method: "POST",
        ...fetchOpts,
      });
      if (!res.ok) {
        setDemos(prev);
        toast.error(await apiError(res));
        return;
      }
      toast.success("Demo unpublished");
    } catch {
      setDemos(prev);
      toast.error("Failed to unpublish demo");
    }
  }

  function handleCopyLink(demo: DemoWithStats) {
    const url = `${window.location.origin}/embed/${demo.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }

  const statuses: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Demos</h1>
        <Button onClick={handleCreate} size="sm">
          <Plus className="size-4" />
          Create demo
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {statuses.map((s) => (
            <Button
              key={s.value}
              variant={statusFilter === s.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s.value)}
            >
              {s.label}
              <span className="ml-1 text-xs opacity-60">
                {statusCounts[s.value]}
              </span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search demos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-60 pl-9"
            />
          </div>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Grid2X2 className="size-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <LayoutList className="size-4" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <DemoEmptyState
          hasFilters={search.trim() !== "" || statusFilter !== "all"}
          onCreate={handleCreate}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((demo) => (
            <DemoCard
              key={demo.id}
              demo={demo}
              onEdit={() => router.push(`/editor/${demo.id}`)}
              onDelete={() => setDeletingDemo(demo)}
              onDuplicate={() => handleDuplicate(demo.id)}
              onPublish={() => handlePublish(demo)}
              onUnpublish={() => handleUnpublish(demo)}
              onCopyLink={() => handleCopyLink(demo)}
              onAnalytics={() => router.push(`/dashboard/demos/${demo.id}/analytics`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((demo) => (
            <DemoCard
              key={demo.id}
              demo={demo}
              layout="list"
              onEdit={() => router.push(`/editor/${demo.id}`)}
              onDelete={() => setDeletingDemo(demo)}
              onDuplicate={() => handleDuplicate(demo.id)}
              onPublish={() => handlePublish(demo)}
              onUnpublish={() => handleUnpublish(demo)}
              onCopyLink={() => handleCopyLink(demo)}
              onAnalytics={() => router.push(`/dashboard/demos/${demo.id}/analytics`)}
            />
          ))}
        </div>
      )}

      <DeleteDemoDialog
        demo={deletingDemo}
        onOpenChange={(open) => {
          if (!open) setDeletingDemo(null);
        }}
        onConfirm={() => {
          if (deletingDemo) handleDelete(deletingDemo.id);
        }}
      />
    </div>
  );
}
