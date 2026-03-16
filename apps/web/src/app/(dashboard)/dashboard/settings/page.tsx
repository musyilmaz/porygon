import { redirect } from "next/navigation";

import { WorkspaceSettings } from "@/components/dashboard/settings/workspace-settings";
import { getSession } from "@/lib/get-session";
import { getDemoService } from "@/lib/services/demo.service";
import { getWorkspaceService } from "@/lib/services/workspace.service";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const workspaceService = getWorkspaceService();
  const workspaces = await workspaceService.list(session.user.id);
  if (workspaces.length === 0) redirect("/onboarding");

  const workspace = workspaces[0]!;
  const [members, demos] = await Promise.all([
    workspaceService.listMembers(workspace.id, session.user.id),
    getDemoService().list(workspace.id, session.user.id),
  ]);
  const currentMember = members.find((m) => m.userId === session.user.id);
  const isAdmin = currentMember?.role === "admin";
  const demoCount = demos.filter((d) => d.status !== "archived").length;

  return (
    <WorkspaceSettings
      workspace={workspace}
      members={members}
      currentUserId={session.user.id}
      isAdmin={isAdmin}
      demoCount={demoCount}
    />
  );
}
