import { createWorkspaceRepository, getDb } from "@repo/db";
import { createWorkspaceService } from "@repo/services";

export function getWorkspaceService() {
  const workspaceRepo = createWorkspaceRepository(getDb());
  return createWorkspaceService({ workspaceRepo });
}
