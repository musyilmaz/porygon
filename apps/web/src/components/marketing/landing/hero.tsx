import { Button } from "@porygon/ui/components/button";
import Link from "next/link";

import { BrowserMock, MockApp } from "@/components/marketing/landing/browser-mock";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 -translate-y-1/3"
        style={{
          background:
            "radial-gradient(ellipse 1200px 600px at 50% 0%, var(--dot-wash), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-12 lg:py-24">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-dot-soft bg-dot-wash py-1.5 pl-2 pr-3 text-xs font-medium text-dot-lo">
              <span className="size-1.5 rounded-full bg-primary" />
              <span>Now with branching flows</span>
              <span className="text-primary">→</span>
            </div>

            <h1 className="mt-7 font-display text-[64px] font-medium leading-[0.95] tracking-[-0.045em] text-foreground sm:text-[88px]">
              Don&apos;t tell.
              <br />
              <em className="font-instrument font-normal italic text-primary">
                Show.
              </em>
            </h1>

            <p className="mt-7 max-w-[480px] text-[19px] leading-[1.5] text-muted-foreground">
              Dot turns your product into a clickable story — branching,
              narrated, measured. The interactive demo platform built for
              teams who sell by <i>showing</i>.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start for free <span className="opacity-70">→</span>
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="gap-2.5" asChild>
                <Link href="#how-it-works">
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-ink-000 text-[10px] text-white">
                    ▶
                  </span>
                  Watch 90-sec tour
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-[13px] text-ink-400">
              {["No credit card", "Free forever plan", "SOC 2 Type II"].map(
                (label) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-chart-2" />
                    {label}
                  </span>
                ),
              )}
            </div>
          </div>

          <BrowserMock
            url="demo.usedot.io/acme-checkout"
            hotspotPos={{ top: "38%", left: "55%" }}
          >
            <MockApp />
          </BrowserMock>
        </div>
      </div>
    </section>
  );
}
