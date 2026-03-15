"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@porygon/ui/components/dialog";
import { Kbd } from "@porygon/ui/components/kbd";
import { Separator } from "@porygon/ui/components/separator";

import { EDITOR_SHORTCUTS } from "./constants";

import { useEditorStore } from "@/stores/editor/editor-store-provider";

export function ShortcutsDialog() {
  const isOpen = useEditorStore((s) => s.isShortcutsHelpOpen);
  const setOpen = useEditorStore((s) => s.setShortcutsHelpOpen);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Shortcuts available in the editor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {EDITOR_SHORTCUTS.map((group, gi) => (
            <div key={group.category}>
              {gi > 0 && <Separator className="mb-4" />}
              <h4 className="mb-2 text-sm font-medium">{group.category}</h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.label}
                    </span>
                    <Kbd keys={shortcut.keys} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
