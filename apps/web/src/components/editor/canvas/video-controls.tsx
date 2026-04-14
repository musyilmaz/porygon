import { Button } from "@porygon/ui/components/button";
import { Pause, Play } from "lucide-react";

import { formatTime } from "@/lib/editor/media-utils";

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}

export function VideoControls({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
}: VideoControlsProps) {
  return (
    <div className="bg-background/80 border-border absolute bottom-14 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg border px-2 py-1 shadow-sm backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onPlayPause}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5" />
        )}
      </Button>
      <input
        type="range"
        min={0}
        max={duration || 1}
        step={0.01}
        value={currentTime}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="accent-primary h-1 w-32 cursor-pointer"
      />
      <span className="text-muted-foreground w-20 text-center text-xs tabular-nums">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}
