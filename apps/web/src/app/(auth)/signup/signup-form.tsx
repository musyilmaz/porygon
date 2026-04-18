"use client";

import { authClient } from "@porygon/auth/client";
import { signupSchema } from "@porygon/shared/validators";
import { Button } from "@porygon/ui/components/button";
import { Input } from "@porygon/ui/components/input";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { OAuthButtons, OAuthDivider } from "@/components/auth/oauth-buttons";

const STRENGTH_LABELS = [
  "USE 8+ CHARS WITH A NUMBER OR SYMBOL",
  "WEAK",
  "FAIR",
  "STRONG",
  "EXCELLENT",
];

const STRENGTH_COLORS = [
  "text-ink-400",
  "text-destructive",
  "text-chart-3",
  "text-chart-2",
  "text-chart-2",
];

function passwordScore(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function StrengthBar({ score }: { score: number }) {
  const colors = [
    "bg-border",
    "bg-destructive",
    "bg-chart-3",
    "bg-chart-2",
    "bg-chart-2",
  ];
  return (
    <div className="mt-1.5 flex gap-1">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={
            "h-[3px] flex-1 rounded-sm transition-colors " +
            (i < score ? colors[score] : "bg-border")
          }
        />
      ))}
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const score = passwordScore(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setServerError("");

    const name = `${firstName} ${lastName}`.trim();
    const result = signupSchema.safeParse({ name, email, password });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const errors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(flat)) {
        if (messages?.[0]) errors[key] = messages[0];
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/onboarding",
    });

    if (error) {
      setLoading(false);
      setServerError(
        error.message ?? "Something went wrong. Please try again.",
      );
      return;
    }

    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="w-full max-w-[460px] rounded-[16px] border border-border bg-card p-10 shadow-[0_12px_32px_-6px_rgba(20,18,40,0.12),0_4px_8px_-2px_rgba(20,18,40,0.06)]">
      <h1 className="font-display text-[32px] font-medium leading-[1.1] tracking-[-0.03em]">
        Show,{" "}
        <em className="font-instrument font-normal italic text-primary">
          don&apos;t tell.
        </em>
      </h1>
      <p className="mb-6 mt-2 text-sm text-muted-foreground">
        Free forever on the Starter plan. No card required.
      </p>

      <OAuthButtons mode="sign-up" callbackURL="/onboarding" />
      <OAuthDivider />

      <form onSubmit={handleSubmit} className="grid gap-3">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="grid gap-1.5">
            <label htmlFor="firstName" className="mono-label">
              First name
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder="Priya"
              className="h-11"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="lastName" className="mono-label">
              Last name
            </label>
            <Input
              id="lastName"
              type="text"
              placeholder="Rao"
              className="h-11"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        {fieldErrors.name ? (
          <p className="text-xs text-destructive">{fieldErrors.name}</p>
        ) : null}

        <div className="grid gap-1.5">
          <label htmlFor="email" className="mono-label">
            Work email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="priya@acme.com"
            className="h-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
            required
          />
          {fieldErrors.email ? (
            <p className="text-xs text-destructive">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="password" className="mono-label">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            className="h-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
            required
            minLength={8}
          />
          <StrengthBar score={score} />
          <p
            className={
              "font-mono text-[11px] tracking-[0.04em] " +
              STRENGTH_COLORS[score]
            }
          >
            {STRENGTH_LABELS[score]}
          </p>
          {fieldErrors.password ? (
            <p className="text-xs text-destructive">{fieldErrors.password}</p>
          ) : null}
        </div>

        {serverError ? (
          <p className="text-center text-sm text-destructive">{serverError}</p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="mt-1 h-11"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : null}
          Create my account →
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-ink-400">
          By signing up you agree to our{" "}
          <Link
            href="/terms"
            className="text-muted-foreground underline underline-offset-2"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-muted-foreground underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already building with Dot?{" "}
        <Link
          href="/login"
          className="border-b border-line-strong pb-[1px] font-medium text-foreground"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
