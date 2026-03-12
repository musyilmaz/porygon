import {
  createDemoRepository,
  createStepRepository,
  createWorkspaceRepository,
  getDb,
} from "@repo/db";
import { createStepService } from "@repo/services";

export function getStepService() {
  const db = getDb();
  const stepRepo = createStepRepository(db);
  const demoRepo = createDemoRepository(db);
  const workspaceRepo = createWorkspaceRepository(db);
  return createStepService({ stepRepo, demoRepo, workspaceRepo });
}
