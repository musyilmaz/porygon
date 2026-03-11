import { redirect } from "next/navigation";

import { OnboardingForm } from "./onboarding-form";

import { getSession } from "@/lib/get-session";
import { getWorkspaceService } from "@/lib/services/workspace.service";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const workspaceService = getWorkspaceService();
  const workspaces = await workspaceService.list(session.user.id);
  if (workspaces.length > 0) redirect("/dashboard");

  return <OnboardingForm userName={session.user.name} />;
}
