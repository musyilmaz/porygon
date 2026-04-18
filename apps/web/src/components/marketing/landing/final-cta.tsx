import { Button } from "@porygon/ui/components/button";
import Link from "next/link";

import { Hotspot } from "@/components/marketing/landing/hotspot";

export function FinalCTA() {
  return (
    <section className="bg-ink-000 px-6 py-24 text-background sm:px-12">
      <div className="mx-auto max-w-[900px] text-center">
        <Hotspot size={20} />
        <h2 className="mt-6 font-display text-[52px] font-medium leading-[1] tracking-[-0.04em] text-background sm:text-[72px]">
          Stop explaining.
          <br />
          <em className="font-instrument font-normal italic text-dot-hi">
            Start showing.
          </em>
        </h2>
        <p className="mx-auto mt-6 max-w-[540px] text-[17px] text-ink-500">
          Free forever for solo creators. 14-day trial on Team. No credit
          card, no gatekept onboarding call.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">
              Start for free <span className="opacity-70">→</span>
            </Link>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white/[0.08] text-background hover:bg-white/[0.14]"
            asChild
          >
            <Link href="mailto:sales@usedot.io">Book a 15-min demo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
