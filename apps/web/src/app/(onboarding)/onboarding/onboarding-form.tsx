"use client";

import { createWorkspaceSchema } from "@porygon/shared/validators";
import { Button } from "@porygon/ui/components/button";
import { Input } from "@porygon/ui/components/input";
import { cn } from "@porygon/ui/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const roles = [
  { id: "sales", icon: "🎯", label: "Closing deals", sub: "Sales · SEs" },
  {
    id: "marketing",
    icon: "📣",
    label: "Running campaigns",
    sub: "PMM · Demand",
  },
  { id: "product", icon: "🧭", label: "Shipping product", sub: "PM · Design" },
  { id: "cs", icon: "💬", label: "Onboarding users", sub: "CS · Support" },
  { id: "founder", icon: "⚡", label: "Building a company", sub: "Founder · Ops" },
  { id: "other", icon: "👋", label: "Exploring", sub: "Just curious" },
];

const firstDemoChoices = [
  {
    id: "extension",
    icon: "🎬",
    title: "Install the capture extension",
    sub: "The fastest path — record your product in one take",
  },
  {
    id: "template",
    icon: "📦",
    title: "Start from a template",
    sub: "Onboarding, pricing reveal, feature tour — 12 templates",
  },
  {
    id: "import",
    icon: "📥",
    title: "Import from Loom / Figma / MP4",
    sub: "Bring existing recordings — we'll add hotspots",
  },
];

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "your-workspace"
  );
}

export function OnboardingForm({ userName }: { userName: string }) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [name, setName] = useState(`${userName}'s Workspace`);
  const [nameError, setNameError] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const subdomain = slugify(name);

  function goNext() {
    setStep((s) => Math.min(totalSteps, s + 1));
  }
  function goPrev() {
    setStep((s) => Math.max(1, s - 1));
  }

  function handleStep1Continue() {
    const result = createWorkspaceSchema.safeParse({ name });
    if (!result.success) {
      setNameError(
        result.error.flatten().fieldErrors.name?.[0] ?? "Invalid name",
      );
      return;
    }
    setNameError("");
    goNext();
  }

  function addInvite() {
    const trimmed = inviteEmail.trim();
    if (!trimmed || !trimmed.includes("@")) return;
    if (invites.includes(trimmed)) return;
    setInvites((list) => [...list, trimmed]);
    setInviteEmail("");
  }

  function removeInvite(email: string) {
    setInvites((list) => list.filter((e) => e !== email));
  }

  async function finish() {
    setServerError("");
    setLoading(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setServerError(
          data.error ?? "Something went wrong. Please try again.",
        );
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setServerError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const progress = (step / totalSteps) * 100;
  const stepLabels = ["01 · WORKSPACE", "02 · ABOUT YOU", "03 · TEAMMATES", "04 · YOU'RE IN"];

  return (
    <div className="w-full max-w-[560px]">
      <div className="mb-4 flex items-center justify-end gap-3 font-mono text-[11px] tracking-[0.08em] text-ink-400">
        <span>
          STEP {step} OF {totalSteps}
        </span>
        <div className="h-1 w-[120px] overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-[16px] border border-border bg-card p-11 shadow-[0_12px_32px_-6px_rgba(20,18,40,0.12),0_4px_8px_-2px_rgba(20,18,40,0.06)]">
        <div className="mb-3.5 font-mono text-[11px] tracking-[0.08em] text-primary">
          {stepLabels[step - 1]}
        </div>

        {step === 1 ? (
          <>
            <h1 className="font-display text-[36px] font-medium leading-[1.05] tracking-[-0.03em]">
              Let&apos;s set up{" "}
              <em className="font-instrument font-normal italic text-primary">
                your workspace.
              </em>
            </h1>
            <p className="mb-7 mt-2.5 text-[15px] leading-[1.5] text-muted-foreground">
              This is where your team&apos;s demos live. You can change it
              later.
            </p>

            <div className="grid gap-1.5">
              <label htmlFor="ws-name" className="mono-label">
                Workspace name
              </label>
              <Input
                id="ws-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder="Acme Labs"
                aria-invalid={!!nameError}
                className="h-11"
              />
              {nameError ? (
                <p className="text-xs text-destructive">{nameError}</p>
              ) : null}
            </div>

            <div className="mt-3.5 grid gap-1.5">
              <span className="mono-label">Your URL</span>
              <div className="flex h-11 items-center rounded-[10px] border border-input bg-muted px-3.5">
                <span className="font-mono text-sm text-foreground">
                  {subdomain}
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  .usedot.io
                </span>
                <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-chart-2">
                  <span className="size-1.5 rounded-full bg-chart-2" />
                  AVAILABLE
                </span>
              </div>
            </div>

            <StepActions>
              <Button variant="ghost" asChild>
                <a href="/dashboard">I&apos;ll do this later</a>
              </Button>
              <Button onClick={handleStep1Continue}>Continue →</Button>
            </StepActions>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h1 className="font-display text-[36px] font-medium leading-[1.05] tracking-[-0.03em]">
              What brings you{" "}
              <em className="font-instrument font-normal italic text-primary">
                to Dot?
              </em>
            </h1>
            <p className="mb-7 mt-2.5 text-[15px] leading-[1.5] text-muted-foreground">
              We&apos;ll tailor your starter templates and tips. Pick what fits
              best.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "relative rounded-[10px] border bg-card p-4 text-left transition-colors",
                    role === r.id
                      ? "border-primary bg-dot-wash"
                      : "border-input hover:border-muted-foreground",
                  )}
                >
                  <span className="mb-2 block text-xl">{r.icon}</span>
                  <div className="text-sm font-medium text-foreground">
                    {r.label}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-400">{r.sub}</div>
                  {role === r.id ? (
                    <span className="absolute right-3.5 top-3 inline-flex size-[18px] items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
                      ✓
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            <StepActions>
              <Button variant="ghost" onClick={goPrev}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button onClick={goNext} disabled={!role}>
                Continue →
              </Button>
            </StepActions>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h1 className="font-display text-[36px] font-medium leading-[1.05] tracking-[-0.03em]">
              Bring your{" "}
              <em className="font-instrument font-normal italic text-primary">
                team.
              </em>
            </h1>
            <p className="mb-7 mt-2.5 text-[15px] leading-[1.5] text-muted-foreground">
              Demos are better with collaborators. Invites are free on every
              plan.
            </p>

            <div className="grid gap-1.5">
              <label htmlFor="invite" className="mono-label">
                Invite by email
              </label>
              <div className="flex gap-2">
                <Input
                  id="invite"
                  type="email"
                  placeholder="teammate@acme.com"
                  className="h-11"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addInvite();
                    }
                  }}
                />
                <Button type="button" onClick={addInvite} className="shrink-0">
                  Add
                </Button>
              </div>
            </div>

            {invites.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {invites.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 rounded-full border border-dot-soft bg-dot-wash py-1 pl-3 pr-1.5 text-xs text-dot-lo"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeInvite(email)}
                      className="text-primary hover:text-dot-lo"
                      aria-label={`Remove ${email}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <StepActions>
              <Button variant="ghost" onClick={goPrev}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={goNext}>
                  Skip
                </Button>
                <Button onClick={goNext}>Send invites →</Button>
              </div>
            </StepActions>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <div className="pb-4 text-center">
              <div className="relative mx-auto mb-5 size-14 rounded-full bg-primary shadow-[0_0_0_10px_var(--dot-ring)]">
                <span className="dot-hotspot absolute inset-0 !size-14" />
              </div>
              <h1 className="font-display text-[36px] font-medium leading-[1.05] tracking-[-0.03em]">
                Let&apos;s build your{" "}
                <em className="font-instrument font-normal italic text-primary">
                  first demo.
                </em>
              </h1>
              <p className="mt-2.5 text-[15px] leading-[1.5] text-muted-foreground">
                Pick how you want to start. You can always add more later.
              </p>
            </div>

            <div className="grid gap-2.5">
              {firstDemoChoices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={finish}
                  disabled={loading}
                  className="flex items-center gap-4 rounded-[10px] border border-input bg-card p-4 text-left transition-colors hover:border-muted-foreground disabled:opacity-60"
                >
                  <span className="flex size-11 items-center justify-center rounded-[10px] bg-dot-wash text-xl">
                    {c.icon}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {c.title}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-400">{c.sub}</div>
                  </div>
                  <span className="text-lg text-primary">→</span>
                </button>
              ))}
            </div>

            {serverError ? (
              <p className="mt-4 text-center text-sm text-destructive">
                {serverError}
              </p>
            ) : null}

            <StepActions>
              <Button variant="ghost" onClick={goPrev} disabled={loading}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button onClick={finish} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : null}
                Take me to my workspace →
              </Button>
            </StepActions>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StepActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
      {children}
    </div>
  );
}
