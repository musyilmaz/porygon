"use client";

import { authClient } from "@porygon/auth/client";
import { Button } from "@porygon/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@porygon/ui/components/card";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  async function handleResend() {
    setLoading(true);
    setError("");
    setResent(false);

    const { error: resendError } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/onboarding",
    });

    setLoading(false);

    if (resendError) {
      setError(resendError.message ?? "Failed to resend. Please try again.");
      return;
    }

    setResent(true);
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Mail className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">Check your email</CardTitle>
        <CardDescription>
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-center text-muted-foreground">
          Click the link in your email to verify your account. If you
          don&apos;t see it, check your spam folder.
        </p>

        {resent && (
          <p className="text-sm text-center text-green-600">
            Verification email resent successfully.
          </p>
        )}

        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={loading || !email}
        >
          {loading && <Loader2 className="animate-spin" />}
          Resend verification email
        </Button>

        <div className="text-center text-sm">
          <Link href="/login" className="underline underline-offset-4">
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
