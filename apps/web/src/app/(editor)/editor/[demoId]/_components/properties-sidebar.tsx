"use client";

import { Input } from "@porygon/ui/components/input";

import { useEditorStore } from "@/stores/editor/editor-store-provider";

export function PropertiesSidebar() {
  const title = useEditorStore((s) => s.demo.title);
  const description = useEditorStore((s) => s.demo.description);
  const updateDemo = useEditorStore((s) => s.updateDemo);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-border flex h-10 shrink-0 items-center border-b px-3">
        <span className="text-xs font-medium uppercase tracking-wide">
          Properties
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="demo-title"
              className="text-muted-foreground text-xs font-medium"
            >
              Title
            </label>
            <Input
              id="demo-title"
              value={title}
              onChange={(e) => updateDemo({ title: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="demo-description"
              className="text-muted-foreground text-xs font-medium"
            >
              Description
            </label>
            <textarea
              id="demo-description"
              value={description ?? ""}
              onChange={(e) =>
                updateDemo({
                  description: e.target.value || null,
                })
              }
              rows={3}
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1"
            />
          </div>

          <div className="border-border border-t pt-4">
            <span className="text-muted-foreground text-xs font-medium">
              Hotspot and annotation properties will appear here when selected.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
