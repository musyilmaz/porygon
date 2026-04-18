import type { ReactNode } from "react";

type Feature = {
  title: string;
  description: string;
  icon: ReactNode;
};

const iconProps = {
  viewBox: "0 0 24 24",
  width: 28,
  height: 28,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const features: Feature[] = [
  {
    title: "Branching flows",
    description:
      "One demo, many paths. Let viewers explore what matters to them — no linear scripts.",
    icon: (
      <svg {...iconProps}>
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="18" r="2" />
        <circle cx="18" cy="6" r="2" />
        <path d="M6 8v4a4 4 0 0 0 4 4h6M18 8v8" />
      </svg>
    ),
  },
  {
    title: "Video + click hybrid",
    description:
      "Blend captured video with live HTML overlays. The best of both worlds, rendered in one take.",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <polygon points="10,9 16,12 10,15" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Smart hotspots",
    description:
      "Auto-detected clickable regions with AI-written tooltips. Edit the copy, keep the motion.",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="10" opacity="0.4" />
      </svg>
    ),
  },
  {
    title: "Analytics that matter",
    description:
      "See which paths convert, where viewers drop, and what your demo actually sells.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
      </svg>
    ),
  },
  {
    title: "Personalization tokens",
    description:
      "Inject the viewer's name, logo, and data into the product — every demo feels bespoke.",
    icon: (
      <svg {...iconProps}>
        <rect x="4" y="8" width="16" height="10" rx="2" />
        <path d="M8 8V5M16 8V5" />
      </svg>
    ),
  },
  {
    title: "Embed anywhere",
    description:
      "One snippet. Works on your site, in email, in Notion, in a LinkedIn post. No iframe jank.",
    icon: (
      <svg {...iconProps}>
        <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 6l-4 12" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-32 sm:px-12">
      <div className="mb-14 max-w-[720px]">
        <div className="mono-label mb-4 !text-primary">02 · FEATURES</div>
        <h2 className="font-display text-[44px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
          The demo toolkit built for teams who{" "}
          <em className="font-instrument font-normal italic text-primary">
            actually ship
          </em>
          .
        </h2>
      </div>

      <div className="grid gap-px overflow-hidden rounded-[14px] border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex min-h-[240px] flex-col bg-card p-8"
          >
            <div className="text-primary">{f.icon}</div>
            <h3 className="mt-6 font-display text-[20px] font-medium tracking-[-0.02em]">
              {f.title}
            </h3>
            <p className="mt-2 text-sm leading-[1.55] text-muted-foreground">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
