import {
  createDemoRepository,
  createStepRepository,
  createWorkspaceRepository,
  getDb,
} from "@porygon/db";
import { createDemoService } from "@porygon/services";

export function getDemoService() {
  const db = getDb();
  const demoRepo = createDemoRepository(db);
  const workspaceRepo = createWorkspaceRepository(db);
  const stepRepo = createStepRepository(db);
  return createDemoService({ demoRepo, workspaceRepo, stepRepo });
}
