"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@porygon/ui/components/tabs";

import { Hotspot } from "@/components/marketing/landing/hotspot";

type Persona = {
  id: string;
  label: string;
  stat: string;
  statLabel: string;
  quote: string;
  who: string;
};

const personas: Persona[] = [
  {
    id: "sales",
    label: "Sales",
    stat: "3.2×",
    statLabel: "more qualified meetings booked",
    quote: "Prospects sell themselves before the first call.",
    who: "Ari · Head of Sales, Kernel",
  },
  {
    id: "marketing",
    label: "Marketing",
    stat: "47%",
    statLabel: "higher landing page conversion",
    quote: "It's the only page of our site people actually touch.",
    who: "Jaya · PMM, Orbital",
  },
  {
    id: "product",
    label: "Product",
    stat: "8 min",
    statLabel: "from capture to published demo",
    quote: "Replaces Loom, Storylane, and a Figma file.",
    who: "Rhea · PM, Vertex",
  },
  {
    id: "cs",
    label: "CS & Onboarding",
    stat: "–62%",
    statLabel: "support tickets in first week",
    quote: "Our onboarding became self-serve overnight.",
    who: "Mo · CS Lead, Payload",
  },
];

function PersonaMock({ id }: { id: string }) {
  if (id === "sales") {
    return (
      <div className="grid gap-3">
        <div className="font-display text-[20px] font-medium">
          Shared with: Vertex Labs · Priya Rao
        </div>
        <div className="relative aspect-[16/9] overflow-hidden rounded-[10px] border border-white/10 bg-gradient-to-br from-ink-100 to-ink-000">
          <div className="absolute" style={{ top: "44%", left: "52%" }}>
            <Hotspot size={20} />
          </div>
          <div className="absolute bottom-4 left-4 rounded-full bg-background px-3.5 py-1.5 text-xs text-foreground">
            <b>Step 3 of 7</b> · &quot;Create your first campaign&quot;
          </div>
        </div>
        <div className="flex gap-2 font-mono text-[11px] text-ink-400">
          <span>VIEWED 4×</span>
          <span>·</span>
          <span>AVG 2:14</span>
          <span>·</span>
          <span>BRANCH: ENTERPRISE</span>
        </div>
      </div>
    );
  }

  if (id === "marketing") {
    return (
      <div className="grid gap-2.5">
        <div className="font-display text-[20px] font-medium">
          Campaign: Q2 Launch
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Homepage hero", cvr: 47 },
            { label: "Blog CTA", cvr: 31 },
            { label: "Email", cvr: 22 },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-white/10 bg-ink-100 p-3"
            >
              <div className="relative mb-2 aspect-[4/3] rounded bg-ink-100/80">
                <div
                  className="absolute"
                  style={{ top: "50%", left: "50%" }}
                >
                  <Hotspot size={10} />
                </div>
              </div>
              <div className="text-[11px] font-medium">{item.label}</div>
              <div className="mt-0.5 font-mono text-[10px] text-dot-hi">
                {item.cvr}% CVR
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 rounded-lg border border-white/10 bg-ink-100 p-3">
          <div className="mono-label !text-ink-400">
            CONVERSION FUNNEL · LAST 7D
          </div>
          <div className="mt-2 flex h-11 items-end gap-1">
            {[100, 78, 52, 41, 36, 31, 28].map((h, i) => (
              <div
                key={i}
                className={
                  "flex-1 rounded-sm " +
                  (i === 6 ? "bg-primary" : "bg-ink-300/50")
                }
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (id === "product") {
    const steps = [
      { n: "01", title: "Open dashboard", time: "0:00 – 0:04" },
      {
        n: "02",
        title: 'Click "New checkout"',
        time: "0:04 – 0:09",
        active: true,
      },
      { n: "03", title: "Fill config form", time: "0:09 – 0:22" },
      {
        n: "04",
        title: "Branch · Stripe vs Adyen",
        time: "0:22 – 0:38",
        branch: true,
      },
      { n: "05", title: "Preview + publish", time: "0:38 – 0:52" },
    ];
    return (
      <div className="grid gap-2 font-mono text-[11px]">
        <div className="font-display text-[20px] font-medium">
          demo · checkout-flow-v4
        </div>
        {steps.map((s) => (
          <div
            key={s.n}
            className={
              "flex items-center gap-3 rounded-lg border px-3 py-2.5 " +
              (s.active
                ? "border-primary bg-dot-wash text-dot-lo"
                : "border-white/10 bg-ink-100 text-ink-500")
            }
          >
            <span className="w-6 text-center font-medium">{s.n}</span>
            <span
              className={
                "flex-1 font-sans text-[13px] " +
                (s.active ? "font-medium" : "text-white")
              }
            >
              {s.title}
            </span>
            {s.branch ? (
              <span className="text-[10px] tracking-[0.08em] text-dot-hi">
                ⎇ BRANCH
              </span>
            ) : null}
            <span>{s.time}</span>
          </div>
        ))}
      </div>
    );
  }

  // cs
  const tasks = [
    { done: true, title: "Connect your data source" },
    { done: true, title: "Invite your team" },
    { done: false, title: "Build your first automation", active: true },
    { done: false, title: "Publish to production" },
  ];
  return (
    <div className="grid gap-2.5">
      <div className="font-display text-[20px] font-medium">
        Welcome, Priya 👋
      </div>
      <div className="mb-2 text-[13px] text-ink-500">
        Let&apos;s get your first workflow running in 4 minutes.
      </div>
      <div className="grid gap-1.5">
        {tasks.map((t, i) => (
          <div
            key={i}
            className={
              "flex items-center gap-2.5 rounded-lg border px-3.5 py-3 " +
              (t.active
                ? "border-primary bg-dot-wash"
                : "border-white/10 bg-ink-100")
            }
          >
            <span
              className={
                "flex size-4 items-center justify-center rounded-full border-[1.5px] text-[11px] text-white " +
                (t.done
                  ? "border-chart-2 bg-chart-2"
                  : t.active
                    ? "border-primary"
                    : "border-white/30")
              }
            >
              {t.done ? "✓" : ""}
            </span>
            <span
              className={
                "font-sans text-[13px] " +
                (t.active
                  ? "font-medium text-dot-lo"
                  : t.done
                    ? "text-ink-500 line-through"
                    : "text-white")
              }
            >
              {t.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Personas() {
  return (
    <section id="use-cases" className="bg-ink-000 py-28 text-background">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <Tabs defaultValue="sales">
          <div className="mb-12 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="mono-label mb-4 !text-primary">
                03 · USE CASES
              </div>
              <h2 className="max-w-[640px] font-display text-[44px] font-medium leading-[1.05] tracking-[-0.03em] text-background sm:text-[52px]">
                One platform.{" "}
                <em className="font-instrument font-normal italic text-dot-hi">
                  Every
                </em>{" "}
                team that talks to customers.
              </h2>
            </div>
            <TabsList className="h-auto gap-1 rounded-full bg-white/[0.06] p-1">
              {personas.map((p) => (
                <TabsTrigger
                  key={p.id}
                  value={p.id}
                  className="rounded-full px-4 py-2.5 text-[13px] font-medium text-ink-500 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {personas.map((p) => (
            <TabsContent
              key={p.id}
              value={p.id}
              className="grid items-stretch gap-12 lg:grid-cols-[1fr_1.3fr]"
            >
              <div className="flex flex-col justify-between py-8">
                <div>
                  <div className="font-display text-[88px] font-medium leading-none tracking-[-0.04em] text-dot-hi">
                    {p.stat}
                  </div>
                  <div className="mt-3 max-w-[380px] text-lg text-ink-500">
                    {p.statLabel}
                  </div>
                </div>
                <div className="mt-12 border-t border-white/10 pt-8">
                  <div className="font-instrument text-[28px] font-normal italic leading-[1.3] text-background">
                    &ldquo;{p.quote}&rdquo;
                  </div>
                  <div className="mt-4 font-mono text-[11px] tracking-[0.08em] text-ink-500">
                    — {p.who}
                  </div>
                </div>
              </div>
              <div className="overflow-hidden rounded-[14px] border border-white/10 bg-ink-000 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="mono-label !text-ink-400">
                    {p.label.toUpperCase()} · DEMO
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-dot-wash px-2.5 py-1 text-[11px] font-medium text-dot-lo">
                    <span className="size-1.5 rounded-full bg-dot-lo" />
                    Live
                  </span>
                </div>
                <PersonaMock id={p.id} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
