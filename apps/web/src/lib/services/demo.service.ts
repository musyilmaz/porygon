import {
  createDemoRepository,
  createStepRepository,
  createWorkspaceRepository,
  getDb,
} from "@repo/db";
import { createDemoService } from "@repo/services";

export function getDemoService() {
  const db = getDb();
  const demoRepo = createDemoRepository(db);
  const workspaceRepo = createWorkspaceRepository(db);
  const stepRepo = createStepRepository(db);
  return createDemoService({ demoRepo, workspaceRepo, stepRepo });
}
