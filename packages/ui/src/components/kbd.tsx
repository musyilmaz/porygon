import { cn } from "@porygon/ui/lib/utils";
import * as React from "react";

const KEY_DISPLAY: Record<string, string> = {
  mod: "⌘",
  ctrl: "Ctrl",
  shift: "⇧",
  alt: "⌥",
  delete: "⌫",
  backspace: "⌫",
  escape: "Esc",
  enter: "↵",
};

const KEY_DISPLAY_NON_MAC: Record<string, string> = {
  mod: "Ctrl",
  shift: "Shift",
  alt: "Alt",
  delete: "Del",
  backspace: "Backspace",
  escape: "Esc",
  enter: "Enter",
};

function isMac() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
}

function resolveKey(key: string): string {
  const lower = key.toLowerCase();
  const map = isMac() ? KEY_DISPLAY : KEY_DISPLAY_NON_MAC;
  return map[lower] ?? key;
}

function Kbd({
  keys,
  children,
  className,
  ...props
}: React.ComponentProps<"kbd"> & {
  keys?: string[];
}) {
  const rendered = keys ? keys.map(resolveKey) : [];

  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-[0.75rem] text-muted-foreground",
        className,
      )}
      {...props}
    >
      {rendered.length > 0
        ? rendered.map((k, i) => (
            <span
              key={i}
              className="inline-flex min-w-5 items-center justify-center rounded border border-border bg-muted px-1 py-0.5 font-mono text-[0.7rem] leading-none shadow-[0_1px_0_0] shadow-border"
            >
              {k}
            </span>
          ))
        : children && (
            <span className="inline-flex min-w-5 items-center justify-center rounded border border-border bg-muted px-1 py-0.5 font-mono text-[0.7rem] leading-none shadow-[0_1px_0_0] shadow-border">
              {children}
            </span>
          )}
    </kbd>
  );
}

export { Kbd };
