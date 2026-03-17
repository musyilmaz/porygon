"use client";

import type { DemoStatus } from "@porygon/shared";
import { Button } from "@porygon/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@porygon/ui/components/dialog";
import { Input } from "@porygon/ui/components/input";
import { Label } from "@porygon/ui/components/label";
import { toast } from "@porygon/ui/components/sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@porygon/ui/components/tabs";
import { AlertTriangle, Check, Code, Copy, Link2 } from "lucide-react";
import { useCallback, useState } from "react";

interface ShareModalProps {
  slug: string;
  status: DemoStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useCopy() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return { copied, copy };
}

function CopyButton({ text }: { text: string }) {
  const { copied, copy } = useCopy();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copy(text)}
      className="shrink-0"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export function ShareModal({
  slug,
  status,
  open,
  onOpenChange,
}: ShareModalProps) {
  const [iframeWidth, setIframeWidth] = useState(800);
  const [iframeHeight, setIframeHeight] = useState(600);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const shareUrl = `${origin}/share/${slug}`;
  const iframeCode = `<iframe src="${origin}/embed/${slug}" width="${iframeWidth}" height="${iframeHeight}" frameborder="0" allowfullscreen></iframe>`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share demo</DialogTitle>
        </DialogHeader>

        {status !== "published" && (
          <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-4 shrink-0" />
            This demo is not published. Visitors won&apos;t be able to view it
            until you publish.
          </div>
        )}

        <Tabs defaultValue="link">
          <TabsList className="w-full">
            <TabsTrigger value="link">
              <Link2 className="size-3.5" />
              Link
            </TabsTrigger>
            <TabsTrigger value="embed">
              <Code className="size-3.5" />
              Embed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-3">
            <div className="flex items-center gap-2">
              <Input value={shareUrl} readOnly className="text-sm" />
              <CopyButton text={shareUrl} />
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-3">
            <textarea
              readOnly
              value={iframeCode}
              rows={3}
              className="border-input bg-background ring-offset-background w-full rounded-md border px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="iframe-width" className="text-xs">
                  Width
                </Label>
                <Input
                  id="iframe-width"
                  type="number"
                  value={iframeWidth}
                  onChange={(e) => setIframeWidth(Number(e.target.value))}
                  className="h-8 w-20 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="iframe-height" className="text-xs">
                  Height
                </Label>
                <Input
                  id="iframe-height"
                  type="number"
                  value={iframeHeight}
                  onChange={(e) => setIframeHeight(Number(e.target.value))}
                  className="h-8 w-20 text-sm"
                />
              </div>
              <div className="flex-1" />
              <CopyButton text={iframeCode} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
