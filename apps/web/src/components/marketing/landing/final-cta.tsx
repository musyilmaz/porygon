import { Button } from "@porygon/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#09090B] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-28">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Ready to build your first demo?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
          Start free with 10 demos, no watermarks, no credit card. Upgrade when
          you&apos;re ready — or don&apos;t. The free plan is free forever.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            className="h-12 rounded-lg bg-white px-6 text-base font-semibold text-[#09090B] shadow-lg transition-all hover:bg-zinc-100 hover:shadow-xl"
            asChild
          >
            <Link href="/signup">
              Start Free <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-12 rounded-lg border border-white/10 px-6 text-base text-zinc-300 hover:bg-white/5 hover:text-white"
            asChild
          >
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
        <p className="mt-5 text-sm text-zinc-500">
          Free forever &middot; No credit card &middot; Setup in under 3 minutes
        </p>
      </div>
    </section>
  );
}
