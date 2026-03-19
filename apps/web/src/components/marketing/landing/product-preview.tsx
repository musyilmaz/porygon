import { Button } from "@porygon/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function ProductPreview() {
  return (
    <section id="product-preview" className="py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            See Porygon in action
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Capture, edit, and share interactive demos — all from your browser.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-xl border bg-muted/50 shadow-2xl">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b bg-muted/80 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full bg-red-400/80" />
              <div className="size-3 rounded-full bg-yellow-400/80" />
              <div className="size-3 rounded-full bg-green-400/80" />
            </div>
            <div className="mx-auto rounded-md bg-background/60 px-4 py-1 text-xs text-muted-foreground">
              app.porygon.dev/editor
            </div>
          </div>
          {/* Editor preview */}
          <div className="aspect-[16/9] bg-gradient-to-br from-slate-50 to-violet-50/30 p-6 sm:p-8">
            <div className="flex h-full gap-4">
              {/* Steps sidebar */}
              <div className="hidden w-52 shrink-0 space-y-3 rounded-lg bg-white/90 p-4 shadow-sm sm:block">
                <div className="h-3 w-16 rounded bg-muted-foreground/20" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-md bg-violet-50 p-2 ring-2 ring-violet-400/30">
                    <div className="size-8 rounded bg-violet-200/50" />
                    <div className="space-y-1">
                      <div className="h-2 w-16 rounded bg-violet-300/50" />
                      <div className="h-1.5 w-12 rounded bg-violet-200/40" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-md p-2">
                    <div className="size-8 rounded bg-muted/60" />
                    <div className="space-y-1">
                      <div className="h-2 w-14 rounded bg-muted/50" />
                      <div className="h-1.5 w-10 rounded bg-muted/30" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-md p-2">
                    <div className="size-8 rounded bg-muted/60" />
                    <div className="space-y-1">
                      <div className="h-2 w-20 rounded bg-muted/50" />
                      <div className="h-1.5 w-8 rounded bg-muted/30" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Main editor area */}
              <div className="flex flex-1 flex-col gap-3 rounded-lg bg-white/90 p-4 shadow-sm">
                {/* Toolbar */}
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded bg-muted/40" />
                  <div className="size-6 rounded bg-muted/40" />
                  <div className="size-6 rounded bg-muted/40" />
                  <div className="ml-auto h-6 w-16 rounded bg-violet-200/50" />
                </div>
                {/* Canvas area */}
                <div className="flex flex-1 items-center justify-center rounded-md bg-muted/20">
                  <div className="text-center">
                    <div className="mx-auto h-4 w-40 rounded bg-muted/40" />
                    <div className="mx-auto mt-2 h-3 w-56 rounded bg-muted/30" />
                    <div className="mx-auto mt-4 flex items-center justify-center">
                      <div className="size-8 rounded-full bg-violet-400/60 ring-4 ring-violet-200/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            size="lg"
            className="bg-violet-600 text-white hover:bg-violet-700"
            asChild
          >
            <Link href="/signup">
              Create your first demo <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
