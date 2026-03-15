"use client";

import { useEffect, useRef, useState } from "react";

interface ContainerSize {
  width: number;
  height: number;
}

export function useContainerSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      );
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}
