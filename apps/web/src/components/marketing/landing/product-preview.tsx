"use client";

import { useState } from "react";

import { BrowserMock, MockApp } from "@/components/marketing/landing/browser-mock";

const steps = [
  {
    n: 1,
    title: "Capture once",
    copy:
      "Install the extension. Click record. Navigate your product like normal. We stitch every click, scroll, and type into a timeline.",
    hotspot: { top: "22%", left: "18%" },
  },
  {
    n: 2,
    title: "Add the hotspots",
    copy:
      "We auto-detect buttons, inputs, and key moments. Accept the suggestions, or drag your own dots anywhere.",
    hotspot: { top: "45%", left: "55%" },
  },
  {
    n: 3,
    title: "Branch the path",
    copy:
      "Give viewers choices. Let a CFO see pricing, a builder see the API. Every path is tracked.",
    hotspot: { top: "62%", left: "38%" },
  },
  {
    n: 4,
    title: "Ship & measure",
    copy:
      "Embed the demo anywhere. See which paths convert, which dots get clicked, and which viewers should get a call.",
    hotspot: { top: "30%", left: "72%" },
  },
];

export function ProductPreview() {
  const [active, setActive] = useState(1);
  const current = steps.find((s) => s.n === active) ?? steps[0]!;

  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-7xl px-6 py-32 sm:px-12"
    >
      <div className="mb-14 max-w-[720px]">
        <div className="mono-label mb-4 !text-primary">04 · HOW IT WORKS</div>
        <h2 className="font-display text-[44px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
          From screen to story in{" "}
          <em className="font-instrument font-normal italic text-primary">
            four
          </em>{" "}
          moves.
        </h2>
      </div>

      <div className="grid gap-12 lg:grid-cols-[360px_1fr] lg:items-start">
        <div className="grid gap-1.5">
          {steps.map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => setActive(s.n)}
              className={
                "rounded-xl border p-5 text-left transition-colors " +
                (s.n === active
                  ? "border-primary bg-dot-wash"
                  : "border-border bg-card hover:border-line-strong")
              }
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium " +
                    (s.n === active
                      ? "bg-primary text-primary-foreground"
                      : "bg-ink-700 text-muted-foreground")
                  }
                >
                  {s.n}
                </span>
                <div className="text-base font-medium">{s.title}</div>
              </div>
              {s.n === active ? (
                <div className="mt-3 text-[13px] leading-[1.55] text-muted-foreground">
                  {s.copy}
                </div>
              ) : null}
            </button>
          ))}
        </div>
        <BrowserMock url="editor.usedot.io" hotspotPos={current.hotspot}>
          <MockApp />
        </BrowserMock>
      </div>
    </section>
  );
}
