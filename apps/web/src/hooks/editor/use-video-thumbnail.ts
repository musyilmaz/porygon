"use client";

import { useEffect, useState } from "react";

export function useVideoThumbnail(videoUrl: string | null): string | null {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl) {
      setThumbnail(null);
      return;
    }

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.muted = true;
    video.src = videoUrl;

    let cancelled = false;

    const handleSeeked = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        setThumbnail(canvas.toDataURL("image/webp"));
      }
      cleanup();
    };

    const handleLoaded = () => {
      if (cancelled) return;
      video.currentTime = 0;
    };

    const cleanup = () => {
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("seeked", handleSeeked);
      video.removeAttribute("src");
      video.load();
    };

    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("seeked", handleSeeked);

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [videoUrl]);

  return thumbnail;
}
