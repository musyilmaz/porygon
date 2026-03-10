import { getDb } from "@repo/db";
import { createWorkspaceService } from "@repo/services";
import { redirect } from "next/navigation";

import { OnboardingForm } from "./onboarding-form";

import { getSession } from "@/lib/get-session";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const workspaceService = createWorkspaceService({ db: getDb() });
  const workspace = await workspaceService.getByUserId(session.user.id);
  if (workspace) redirect("/dashboard");

  return <OnboardingForm userName={session.user.name} />;
}
