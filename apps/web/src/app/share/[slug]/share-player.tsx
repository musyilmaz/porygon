"use client";

import type { PlayerConfig } from "@porygon/player";
import { DemoPlayerRenderer } from "@porygon/player";
import { useEffect, useRef } from "react";

interface SharePlayerProps {
  config: PlayerConfig;
}

export function SharePlayer({ config }: SharePlayerProps) {
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
    <div className="flex min-h-dvh flex-col bg-neutral-950">
      <header className="flex-none px-6 py-4">
        <h1 className="text-lg font-semibold text-white">{config.title}</h1>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-6">
        <div
          ref={containerRef}
          className="w-full max-w-5xl overflow-hidden rounded-lg"
        />
      </main>

      <footer className="flex-none px-6 py-3 text-center">
        <span className="text-xs text-neutral-500">Powered by Porygon</span>
      </footer>
    </div>
  );
}
