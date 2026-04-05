import { Button } from "@porygon/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ScrollLink } from "@/components/marketing/scroll-link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#09090B]">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-violet-600/[0.07] blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-28 text-center sm:px-6 lg:pb-24 lg:pt-36">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[13px] text-zinc-400">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>
          Early Access
        </div>

        {/* Headline */}
        <h1 className="mx-auto mt-6 max-w-2xl text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
          The demo builder that doesn&apos;t charge per&nbsp;seat
        </h1>

        {/* Sub */}
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
          Capture your product with a Chrome extension, add hotspots and
          tooltips, share anywhere. Flat pricing, no watermarks.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            size="lg"
            className="h-11 rounded-lg bg-white px-5 text-sm font-semibold text-[#09090B] hover:bg-zinc-200"
            asChild
          >
            <Link href="/signup">
              Start Free <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-11 rounded-lg border border-white/10 px-5 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
            asChild
          >
            <ScrollLink href="#pricing">See Pricing</ScrollLink>
          </Button>
        </div>

        <p className="mt-4 text-[13px] text-zinc-600">
          Free forever &middot; No credit card required
        </p>

        {/* Browser mockup */}
        <div className="mx-auto mt-14 max-w-3xl">
          <div className="overflow-hidden rounded-t-xl border border-white/[0.08] bg-white/[0.03]">
            {/* Chrome bar */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-white/10" />
                <div className="size-2.5 rounded-full bg-white/10" />
                <div className="size-2.5 rounded-full bg-white/10" />
              </div>
              <div className="mx-auto rounded-md bg-white/[0.05] px-8 py-1 text-[11px] text-zinc-600">
                app.usedot.io/editor
              </div>
            </div>
            {/* Editor content */}
            <div className="aspect-[16/9] bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-4 sm:p-6">
              <div className="flex h-full gap-3">
                {/* Sidebar */}
                <div className="hidden w-40 shrink-0 space-y-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 sm:block">
                  <div className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
                    Steps
                  </div>
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${n === 1 ? "bg-violet-500/10 ring-1 ring-violet-500/20" : ""}`}
                    >
                      <div
                        className={`flex size-5 items-center justify-center rounded text-[9px] font-bold ${n === 1 ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-zinc-600"}`}
                      >
                        {n}
                      </div>
                      <div className="h-1.5 w-12 rounded bg-white/[0.06]" />
                    </div>
                  ))}
                </div>
                {/* Canvas */}
                <div className="flex flex-1 flex-col rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-1 border-b border-white/[0.06] px-3 py-1.5">
                    <div className="size-5 rounded bg-white/[0.04]" />
                    <div className="size-5 rounded bg-violet-500/20" />
                    <div className="size-5 rounded bg-white/[0.04]" />
                    <div className="ml-auto h-5 w-12 rounded bg-violet-500/30" />
                  </div>
                  <div className="relative flex flex-1 items-center justify-center">
                    <div className="w-3/5 space-y-2 rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
                      <div className="h-2.5 w-2/3 rounded bg-white/[0.08]" />
                      <div className="h-2 w-4/5 rounded bg-white/[0.04]" />
                      <div className="mt-3 h-6 w-1/3 rounded bg-violet-500/40" />
                    </div>
                    {/* Hotspot */}
                    <div className="absolute right-[28%] top-[30%] size-4 rounded-full bg-violet-500/80 ring-4 ring-violet-500/20" />
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
