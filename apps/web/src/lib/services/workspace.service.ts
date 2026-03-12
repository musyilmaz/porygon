import { createWorkspaceRepository, getDb } from "@porygon/db";
import { createWorkspaceService } from "@porygon/services";

export function getWorkspaceService() {
  const workspaceRepo = createWorkspaceRepository(getDb());
  return createWorkspaceService({ workspaceRepo });
}
