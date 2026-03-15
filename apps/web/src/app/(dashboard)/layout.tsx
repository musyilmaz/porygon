import { SidebarInset, SidebarProvider } from "@porygon/ui/components/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getSession } from "@/lib/get-session";
import { getWorkspaceService } from "@/lib/services/workspace.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const workspaceService = getWorkspaceService();
  const workspaces = await workspaceService.list(session.user.id);

  if (workspaces.length === 0) redirect("/onboarding");

  const workspace = workspaces[0]!;

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen = sidebarState !== "false";

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        user={user}
        workspace={{ name: workspace.name, plan: workspace.plan }}
      />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
