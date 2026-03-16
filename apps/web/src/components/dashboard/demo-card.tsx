"use client";

import type { DemoWithStats } from "@porygon/services";
import { Badge } from "@porygon/ui/components/badge";
import { Button } from "@porygon/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@porygon/ui/components/dropdown-menu";
import {
  BarChart3,
  Copy,
  Eye,
  Footprints,
  Globe,
  GlobeLock,
  Link,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";

interface DemoCardProps {
  demo: DemoWithStats;
  layout?: "grid" | "list";
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onCopyLink: () => void;
  onAnalytics: () => void;
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  published: { label: "Published", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
} as const;

function formatRelativeDate(date: Date | string): string {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth}mo ago`;
}

function Thumbnail({ src, alt }: { src: string | null; alt: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        unoptimized
      />
    );
  }
  return (
    <div className="h-full w-full bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/5" />
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) return null;

  if ("className" in config) {
    return <Badge className={config.className}>{config.label}</Badge>;
  }
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function ActionsMenu({
  demo,
  onEdit,
  onDelete,
  onDuplicate,
  onPublish,
  onUnpublish,
  onCopyLink,
  onAnalytics,
}: Omit<DemoCardProps, "layout">) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Demo actions"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAnalytics}>
          <BarChart3 />
          Analytics
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {demo.status === "published" ? (
          <DropdownMenuItem onClick={onUnpublish}>
            <GlobeLock />
            Unpublish
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onPublish}>
            <Globe />
            Publish
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onCopyLink}>
          <Link />
          Copy share link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DemoCard(props: DemoCardProps) {
  const { demo, layout = "grid" } = props;

  if (layout === "list") {
    return (
      <div className="flex items-center gap-4 rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-accent/50">
        <button
          className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-muted"
          onClick={props.onEdit}
        >
          <Thumbnail src={demo.thumbnailUrl} alt={demo.title} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="min-w-0 flex-1">
            <button
              className="truncate text-sm font-medium hover:underline"
              onClick={props.onEdit}
            >
              {demo.title}
            </button>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Footprints className="size-3" />
                {demo.stepCount} {demo.stepCount === 1 ? "step" : "steps"}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="size-3" />
                {demo.totalViews}
              </span>
              <span>{formatRelativeDate(demo.updatedAt)}</span>
            </div>
          </div>

          <StatusBadge status={demo.status} />
          <ActionsMenu {...props} />
        </div>
      </div>
    );
  }

  return (
    <div className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-colors hover:bg-accent/50">
      <div className="relative">
        <button
          className="block aspect-[16/10] w-full cursor-pointer overflow-hidden bg-muted"
          onClick={props.onEdit}
          aria-label={`Edit ${demo.title}`}
        >
          <Thumbnail src={demo.thumbnailUrl} alt={demo.title} />
        </button>
        <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <ActionsMenu {...props} />
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <button
            className="truncate text-sm font-medium hover:underline"
            onClick={props.onEdit}
          >
            {demo.title}
          </button>
          <StatusBadge status={demo.status} />
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Footprints className="size-3" />
            {demo.stepCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {demo.totalViews}
          </span>
          <span>{formatRelativeDate(demo.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
