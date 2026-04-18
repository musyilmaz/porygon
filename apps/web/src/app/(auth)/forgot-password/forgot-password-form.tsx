"use client";

import { authClient } from "@porygon/auth/client";
import { forgotPasswordSchema } from "@porygon/shared/validators";
import { Button } from "@porygon/ui/components/button";
import { Input } from "@porygon/ui/components/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Hotspot } from "@/components/marketing/landing/hotspot";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setServerError("");

    const result = forgotPasswordSchema.safeParse({ email });
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
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setLoading(false);

    if (error) {
      setServerError(
        error.message ?? "Something went wrong. Please try again.",
      );
      return;
    }

    setSentToEmail(email);
  }

  if (sentToEmail) {
    return (
      <div className="w-full max-w-[420px] rounded-[16px] border border-border bg-card p-10 text-center shadow-[0_12px_32px_-6px_rgba(20,18,40,0.12),0_4px_8px_-2px_rgba(20,18,40,0.06)]">
        <div className="mb-4">
          <Hotspot size={16} />
        </div>
        <h1 className="font-display text-[24px] font-medium tracking-[-0.02em]">
          Check your inbox.
        </h1>
        <p className="mt-2 text-sm leading-[1.55] text-muted-foreground">
          If an account exists, we just sent a reset link to:
        </p>
        <div className="mt-5 rounded-lg border border-dot-soft bg-dot-wash px-3.5 py-2.5 font-mono text-[13px] text-dot-lo">
          {sentToEmail}
        </div>
        <p className="mt-5 text-sm leading-[1.55] text-muted-foreground">
          Link expires in 30 minutes. Didn&apos;t get it? Check spam or try a
          different email.
        </p>
        <Button
          variant="ghost"
          className="mt-5 w-full"
          onClick={() => {
            setSentToEmail(null);
            setEmail("");
          }}
        >
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] rounded-[16px] border border-border bg-card p-10 shadow-[0_12px_32px_-6px_rgba(20,18,40,0.12),0_4px_8px_-2px_rgba(20,18,40,0.06)]">
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </Link>

      <h1 className="font-display text-[28px] font-medium leading-[1.15] tracking-[-0.03em]">
        Forgot your{" "}
        <em className="font-instrument font-normal italic text-primary">
          password?
        </em>
      </h1>
      <p className="mb-7 mt-2 text-sm leading-[1.5] text-muted-foreground">
        No judgement. Drop your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-3.5">
        <div className="grid gap-1.5">
          <label htmlFor="email" className="mono-label">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="h-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
            autoFocus
            required
          />
          {fieldErrors.email ? (
            <p className="text-xs text-destructive">{fieldErrors.email}</p>
          ) : null}
        </div>

        {serverError ? (
          <p className="text-center text-sm text-destructive">{serverError}</p>
        ) : null}

        <Button type="submit" size="lg" className="h-11" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : null}
          Send reset link
        </Button>
      </form>
    </div>
  );
}
