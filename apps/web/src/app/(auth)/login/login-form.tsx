"use client";

import { authClient } from "@porygon/auth/client";
import { loginSchema } from "@porygon/shared/validators";
import { Button } from "@porygon/ui/components/button";
import { Input } from "@porygon/ui/components/input";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { OAuthButtons, OAuthDivider } from "@/components/auth/oauth-buttons";
import { Hotspot } from "@/components/marketing/landing/hotspot";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setServerError("");

    const result = loginSchema.safeParse({ email, password });
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
    const { error } = await authClient.signIn.email({
      email,
      password,
      rememberMe: keepSignedIn,
    });

    if (error) {
      setLoading(false);
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setServerError("EMAIL_NOT_VERIFIED");
      } else {
        setServerError(
          error.message ?? "Something went wrong. Please try again.",
        );
      }
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <div className="w-full max-w-[420px] rounded-[16px] border border-border bg-card p-10 shadow-[0_12px_32px_-6px_rgba(20,18,40,0.12),0_4px_8px_-2px_rgba(20,18,40,0.06)]">
      <h1 className="font-display text-[32px] font-medium leading-[1.1] tracking-[-0.03em]">
        Welcome{" "}
        <em className="font-instrument font-normal italic text-primary">
          back.
        </em>
      </h1>
      <p className="mb-7 mt-2 text-sm text-muted-foreground">
        Sign in to usedot.io to keep shipping demos that sell.
      </p>

      <OAuthButtons mode="sign-in" callbackURL={callbackUrl} />
      <OAuthDivider />

      {searchParams.get("reset") === "success" ? (
        <p className="mb-4 rounded-lg border border-chart-2/40 bg-chart-2/10 px-3 py-2 text-sm text-chart-2">
          Password reset successfully. Please sign in.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-3.5">
        <div className="grid gap-1.5">
          <label
            htmlFor="email"
            className="mono-label"
          >
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

        <div className="grid gap-1.5">
          <label
            htmlFor="password"
            className="mono-label"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
            required
            minLength={6}
          />
          {fieldErrors.password ? (
            <p className="text-xs text-destructive">{fieldErrors.password}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex cursor-pointer select-none items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              className="accent-primary"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
            />
            Keep me signed in
          </label>
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:text-dot-lo"
          >
            Forgot password?
          </Link>
        </div>

        {serverError && serverError === "EMAIL_NOT_VERIFIED" ? (
          <div className="text-center text-sm">
            <p className="text-destructive">
              Please verify your email before signing in.
            </p>
            <Link
              href={`/verify-email?email=${encodeURIComponent(email)}`}
              className="text-primary underline underline-offset-4"
            >
              Resend verification email
            </Link>
          </div>
        ) : serverError ? (
          <p className="text-center text-sm text-destructive">{serverError}</p>
        ) : null}

        <Button type="submit" size="lg" className="h-11" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : null}
          Sign in →
        </Button>

        <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-dot-wash p-3 text-xs text-dot-lo">
          <Hotspot size={8} />
          <span>
            SSO available on Team and Scale plans.{" "}
            <Link
              href="/login/sso"
              className="font-medium text-dot-lo hover:underline"
            >
              Use SSO
            </Link>
          </span>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        New to Dot?{" "}
        <Link
          href="/signup"
          className="border-b border-line-strong pb-[1px] font-medium text-foreground"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
