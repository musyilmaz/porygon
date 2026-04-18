import { Hotspot } from "@/components/marketing/landing/hotspot";

const testimonials = [
  {
    quote:
      "We replaced three tools, cut our demo production from two days to twenty minutes, and our AEs actually use it.",
    author: "Ari Nakamura",
    role: "Head of Sales, Kernel",
    stat: "3.2× booked meetings",
  },
  {
    quote:
      "The branching is the unlock. We finally stopped guessing what prospects cared about and let them show us.",
    author: "Jaya Shah",
    role: "PMM, Orbital",
    stat: "47% → 61% CVR",
  },
  {
    quote: "It just feels like the product. Which is the whole point.",
    author: "Rhea Connolly",
    role: "PM, Vertex",
    stat: "8 min · capture → ship",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-32 pt-10 sm:px-12">
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.author}
            className="flex min-h-[280px] flex-col gap-6 rounded-[14px] border border-border bg-card p-7"
          >
            <Hotspot />
            <blockquote className="flex-1 font-display text-[19px] font-normal leading-[1.4] tracking-[-0.01em] text-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption>
              <div className="text-[13px] font-medium">{t.author}</div>
              <div className="text-xs text-ink-400">{t.role}</div>
              <div className="mt-2.5 font-mono text-[11px] tracking-[0.04em] text-primary">
                → {t.stat}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
