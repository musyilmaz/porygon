import { Badge } from "@porygon/ui/components/badge";
import { Button } from "@porygon/ui/components/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

import { ScrollLink } from "@/components/marketing/scroll-link";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Text */}
        <div className="flex flex-col items-start gap-6">
          <Badge variant="secondary" className="text-violet-700">
            Early Access
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Create interactive demos in minutes
          </h1>

          <p className="max-w-lg text-lg text-muted-foreground">
            Capture your product with a Chrome extension. Add hotspots and
            tooltips. Share anywhere. No watermarks. No per-seat pricing.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="bg-violet-600 text-white hover:bg-violet-700"
              asChild
            >
              <Link href="/signup">
                Start Free <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <ScrollLink href="#product-preview">
                See it in action <ChevronDown className="size-4" />
              </ScrollLink>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Free forever &middot; No credit card &middot; 10 demos included
          </p>
        </div>

        {/* Browser mockup */}
        <div className="relative">
          <div className="overflow-hidden rounded-xl border bg-muted/50 shadow-2xl">
            <div className="flex items-center gap-2 border-b bg-muted/80 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-400/80" />
                <div className="size-3 rounded-full bg-yellow-400/80" />
                <div className="size-3 rounded-full bg-green-400/80" />
              </div>
              <div className="mx-auto rounded-md bg-background/60 px-4 py-1 text-xs text-muted-foreground">
                app.porygon.dev
              </div>
            </div>
            <div className="aspect-[16/10] bg-gradient-to-br from-violet-50 to-white p-6">
              <div className="flex h-full gap-4">
                {/* Sidebar mockup */}
                <div className="hidden w-48 shrink-0 space-y-3 rounded-lg bg-white/90 p-4 shadow-sm sm:block">
                  <div className="h-3 w-20 rounded bg-muted-foreground/20" />
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
                        <div className="h-2 w-16 rounded bg-muted/50" />
                        <div className="h-1.5 w-8 rounded bg-muted/30" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Main area mockup */}
                <div className="flex flex-1 flex-col gap-3 rounded-lg bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded bg-muted/40" />
                    <div className="size-6 rounded bg-muted/40" />
                    <div className="size-6 rounded bg-muted/40" />
                    <div className="ml-auto h-6 w-16 rounded bg-violet-200/50" />
                  </div>
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
        </div>
      </div>
    </section>
  );
}
