import { redirect } from "next/navigation";

import { DemoList } from "@/components/dashboard/demo-list";
import { getSession } from "@/lib/get-session";
import { getDemoService } from "@/lib/services/demo.service";
import { getWorkspaceService } from "@/lib/services/workspace.service";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const workspaceService = getWorkspaceService();
  const workspaces = await workspaceService.list(session.user.id);
  if (workspaces.length === 0) redirect("/onboarding");

  const workspace = workspaces[0]!;
  const demoService = getDemoService();
  const allDemos = await demoService.listWithStats(
    workspace.id,
    session.user.id,
  );
  const demos = allDemos.filter((d) => d.status !== "archived");

  return <DemoList initialDemos={demos} workspaceId={workspace.id} />;
}
