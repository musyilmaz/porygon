"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@porygon/ui/components/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@porygon/ui/components/context-menu";
import { cn } from "@porygon/ui/lib/utils";
import { Copy, GripVertical, Play, Plus, Trash2, Video } from "lucide-react";

import { useVideoThumbnail } from "@/hooks/editor/use-video-thumbnail";
import type { EditorStep } from "@/stores/editor/types";

const ACTION_TYPE_LABELS: Record<string, string> = {
  click: "Click",
  scroll: "Scroll",
  type: "Type",
  navigation: "Nav",
};

function VideoThumbnail({ videoUrl }: { videoUrl: string }) {
  const thumbnail = useVideoThumbnail(videoUrl);
  if (!thumbnail) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={thumbnail} alt="Video frame" className="h-full w-full object-cover" />;
}

interface SortableStepCardProps {
  step: EditorStep;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onInsertBefore: () => void;
  onInsertAfter: () => void;
}

export function SortableStepCard({
  step,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onInsertBefore,
  onInsertAfter,
}: SortableStepCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={cn(
            "group relative flex flex-col gap-1 rounded-md border p-1.5 text-left transition-colors",
            isSelected
              ? "border-primary bg-accent"
              : "border-border hover:border-border/80 hover:bg-accent/50",
            isDragging && "z-50 opacity-50",
          )}
          onClick={onSelect}
        >
          <div className="flex items-center gap-1">
            <button
              className="text-muted-foreground hover:text-foreground -ml-0.5 cursor-grab touch-none p-0.5 active:cursor-grabbing"
              suppressHydrationWarning
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-3.5" />
            </button>
            <span className="text-muted-foreground text-xs">
              {index + 1}
            </span>
            <div className="ml-auto flex items-center gap-1">
              {step.mediaType === "video" && (
                <Badge variant="outline" className="h-4 px-1 text-[10px]">
                  <Video className="mr-0.5 size-2.5" />
                  Video
                </Badge>
              )}
              {step.actionType && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {ACTION_TYPE_LABELS[step.actionType] ?? step.actionType}
                </Badge>
              )}
            </div>
          </div>
          <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-sm">
            {step.screenshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={step.screenshotUrl}
                alt={`Step ${index + 1}`}
                className="h-full w-full object-cover"
              />
            ) : step.mediaType === "video" && step.videoUrl ? (
              <VideoThumbnail videoUrl={step.videoUrl} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-foreground text-[10px]">
                  No screenshot
                </span>
              </div>
            )}
            {step.mediaType === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex size-6 items-center justify-center rounded-full bg-black/50">
                  <Play className="size-3 fill-white text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 size-4" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onInsertBefore}>
          <Plus className="mr-2 size-4" />
          Insert Before
        </ContextMenuItem>
        <ContextMenuItem onClick={onInsertAfter}>
          <Plus className="mr-2 size-4" />
          Insert After
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 size-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
