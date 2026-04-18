"use client";

import { authClient } from "@porygon/auth/client";
import { Button } from "@porygon/ui/components/button";
import { useState } from "react";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.16c-3.34.72-4.04-1.4-4.04-1.4-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.77.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58C20.56 21.79 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

type Provider = "google" | "github";

export function OAuthButtons({
  mode = "sign-in",
  callbackURL = "/dashboard",
}: {
  mode?: "sign-in" | "sign-up";
  callbackURL?: string;
}) {
  const [loading, setLoading] = useState<Provider | null>(null);
  const verb = mode === "sign-up" ? "Sign up with" : "Continue with";

  async function signInWith(provider: Provider) {
    setLoading(provider);
    await authClient.signIn.social({ provider, callbackURL });
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-11"
        disabled={loading !== null}
        onClick={() => signInWith("google")}
      >
        <GoogleIcon />
        <span className="truncate">{verb} Google</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11"
        disabled={loading !== null}
        onClick={() => signInWith("github")}
      >
        <GitHubIcon />
        <span className="truncate">{verb} GitHub</span>
      </Button>
    </div>
  );
}

export function OAuthDivider({ label = "OR WITH EMAIL" }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3 font-mono text-[11px] tracking-[0.08em] text-ink-400">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
