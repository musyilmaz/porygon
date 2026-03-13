"use client";

import type { PlayerConfig } from "@porygon/player";
import { DemoPlayerRenderer } from "@porygon/player";
import { useEffect, useRef } from "react";

interface EmbedPlayerProps {
  config: PlayerConfig;
}

export function EmbedPlayer({ config }: EmbedPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<DemoPlayerRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const analyticsUrl = window.location.origin;

    rendererRef.current = new DemoPlayerRenderer({
      container,
      config,
      analyticsUrl,
    });

    return () => {
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, [config]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
