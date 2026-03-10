"use client";

import { createWorkspaceSchema } from "@repo/shared/validators";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function OnboardingForm({ userName }: { userName: string }) {
  const router = useRouter();

  const [name, setName] = useState(`${userName}'s Workspace`);
  const [fieldError, setFieldError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError("");
    setServerError("");

    const result = createWorkspaceSchema.safeParse({ name });
    if (!result.success) {
      const msg = result.error.flatten().fieldErrors.name?.[0];
      if (msg) setFieldError(msg);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setServerError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create your workspace</CardTitle>
        <CardDescription>
          Give your workspace a name to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
              <Input
                id="workspace-name"
                type="text"
                placeholder="My Workspace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!fieldError}
              />
              {fieldError && <FieldError>{fieldError}</FieldError>}
            </Field>
            {serverError && (
              <p className="text-destructive text-sm text-center">
                {serverError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Create workspace
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
