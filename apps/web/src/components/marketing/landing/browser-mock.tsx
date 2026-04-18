import { Hotspot } from "@/components/marketing/landing/hotspot";

export function BrowserMock({
  children,
  url = "demo.usedot.io/acme-checkout",
  showHotspot = true,
  hotspotPos,
  showRec = true,
}: {
  children?: React.ReactNode;
  url?: string;
  showHotspot?: boolean;
  hotspotPos?: { top?: string; left?: string };
  showRec?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-card shadow-2xl">
      <div className="flex items-center gap-2.5 border-b border-border bg-muted px-3.5 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#ffbd2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-2 flex h-[22px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-2.5 font-mono text-[11px] text-ink-400">
          <span className="size-2 rounded-full bg-chart-2" />
          {url}
        </div>
        {showRec ? (
          <span className="rounded-full border border-primary px-2 py-[3px] font-mono text-[10px] tracking-[0.08em] text-primary">
            ● REC
          </span>
        ) : null}
      </div>
      <div className="relative aspect-[16/10]">
        {children}
        {showHotspot ? (
          <div
            className="absolute"
            style={{
              top: hotspotPos?.top ?? "38%",
              left: hotspotPos?.left ?? "55%",
            }}
          >
            <Hotspot size={18} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MockApp() {
  return (
    <div className="grid h-full grid-cols-[220px_1fr] bg-background">
      <aside className="border-r border-border bg-card p-5">
        <div className="mb-3 font-mono text-[10px] tracking-[0.12em] text-ink-400">
          ACME · WORKSPACE
        </div>
        <div className="grid gap-1">
          {["Dashboard", "Projects", "Team", "Billing", "Settings"].map(
            (label, i) => (
              <div
                key={label}
                className={
                  "rounded-md px-2.5 py-2 text-[13px] " +
                  (i === 1
                    ? "bg-ink-700 font-medium text-foreground"
                    : "text-muted-foreground")
                }
              >
                {label}
              </div>
            ),
          )}
        </div>
      </aside>
      <main className="p-7">
        <div className="mb-6 flex items-center justify-between">
          <div className="font-display text-[22px] font-medium tracking-[-0.02em]">
            Projects
          </div>
          <span className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground">
            + New project
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-[10px] border border-border bg-card p-3.5"
            >
              <div className="mb-2.5 aspect-[16/10] rounded-md bg-ink-700" />
              <div className="text-[13px] font-medium">Project {i}</div>
              <div className="mt-0.5 font-mono text-[11px] text-ink-400">
                UPDATED 2H AGO
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
