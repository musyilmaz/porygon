import { Chrome } from "lucide-react";
import type { ReactNode } from "react";

function Row({
  label,
  title,
  description,
  visual,
  reverse,
}: {
  label: string;
  title: string;
  description: string;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <div className={reverse ? "lg:order-2" : ""}>
        <p className="text-sm font-medium text-violet-600">{label}</p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>{visual}</div>
    </div>
  );
}

/* ── Visuals ── */

function CaptureVisual() {
  return (
    <div className="overflow-hidden rounded-xl border bg-zinc-50 shadow-sm">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <Chrome className="size-4 text-violet-600" />
        <span className="text-xs font-medium">dot Capture</span>
        <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          Recording
        </span>
      </div>
      <div className="space-y-1.5 p-4">
        {["Welcome screen", "Click Sign Up", "Fill details"].map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2"
          >
            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-violet-100 text-[10px] font-bold text-violet-700">
              {i + 1}
            </div>
            <span className="text-xs">{step}</span>
            <div className="ml-auto size-6 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorVisual() {
  return (
    <div className="overflow-hidden rounded-xl border bg-zinc-50 shadow-sm">
      <div className="flex items-center gap-1 border-b px-3 py-2">
        {["Select", "Hotspot", "Blur"].map((t, i) => (
          <div
            key={t}
            className={`rounded px-2 py-0.5 text-[10px] font-medium ${i === 1 ? "bg-violet-100 text-violet-700" : "text-muted-foreground"}`}
          >
            {t}
          </div>
        ))}
        <div className="ml-auto rounded bg-violet-600 px-2.5 py-0.5 text-[10px] font-medium text-white">
          Publish
        </div>
      </div>
      <div className="relative flex aspect-[4/3] items-center justify-center bg-white p-6">
        <div className="w-4/5 max-w-[220px] space-y-2 rounded-lg border p-4">
          <div className="h-2.5 w-2/3 rounded bg-zinc-200" />
          <div className="h-2 w-full rounded bg-zinc-100" />
          <div className="h-2 w-3/4 rounded bg-zinc-100" />
          <div className="mt-3 h-7 w-24 rounded bg-violet-500" />
        </div>
        <div className="absolute right-[25%] top-[30%]">
          <div className="size-5 rounded-full bg-violet-500 ring-4 ring-violet-200/60" />
        </div>
        <div className="absolute bottom-[30%] right-[18%] rounded-lg border bg-white px-2.5 py-1.5 shadow-md">
          <div className="h-1.5 w-16 rounded bg-zinc-300" />
          <div className="mt-1 h-1 w-24 rounded bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  return (
    <div className="overflow-hidden rounded-xl border bg-zinc-50 shadow-sm">
      <div className="border-b px-4 py-2.5">
        <span className="text-xs font-medium">Analytics</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Views", value: "1,247" },
            { label: "Completed", value: "68%" },
            { label: "Avg. time", value: "1m 34s" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border bg-white p-2.5 text-center">
              <div className="text-base font-bold">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-end gap-1 rounded-lg border bg-white p-3">
          {[100, 92, 85, 71, 68].map((pct, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
              <span className="text-[8px] text-muted-foreground">{pct}%</span>
              <div
                className="w-full rounded-sm bg-violet-500"
                style={{ height: `${pct * 0.5}px` }}
              />
              <span className="text-[8px] text-muted-foreground">S{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="mx-auto max-w-5xl space-y-24 px-4 sm:px-6 lg:space-y-32">
        <Row
          label="Capture"
          title="Record demos with a Chrome extension"
          description="Install the extension, start recording, browse your product. Every click creates a step with a screenshot. No uploads, no manual work."
          visual={<CaptureVisual />}
        />
        <Row
          label="Edit"
          title="Add hotspots, tooltips, and branching"
          description="Place interactive hotspots, write rich tooltips, blur sensitive data, reorder steps. Create branching paths so different audiences see different flows."
          visual={<EditorVisual />}
          reverse
        />
        <Row
          label="Share & Measure"
          title="Embed anywhere, track everything"
          description="Get a link or embed code for your site, docs, or emails. Export as GIF. Track views, completion rates, and step-by-step drop-off."
          visual={<AnalyticsVisual />}
        />
      </div>
    </section>
  );
}
