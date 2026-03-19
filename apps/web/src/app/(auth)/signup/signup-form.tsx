"use client";

import { authClient } from "@porygon/auth/client";
import { signupSchema } from "@porygon/shared/validators";
import { Button } from "@porygon/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@porygon/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@porygon/ui/components/field";
import { Input } from "@porygon/ui/components/input";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setServerError("");

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
      setServerError(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>Get started with Porygon</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <FieldError>{fieldErrors.name}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <FieldError>{fieldErrors.email}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!fieldErrors.password}
              />
              {fieldErrors.password && (
                <FieldError>{fieldErrors.password}</FieldError>
              )}
            </Field>
            {serverError && (
              <p className="text-destructive text-sm text-center">
                {serverError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Sign up
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
                Privacy Policy
              </Link>
              .
            </p>
          </FieldGroup>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
