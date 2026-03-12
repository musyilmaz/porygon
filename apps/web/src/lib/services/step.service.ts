import {
  createDemoRepository,
  createStepRepository,
  createWorkspaceRepository,
  getDb,
} from "@porygon/db";
import { createStepService } from "@porygon/services";

export function getStepService() {
  const db = getDb();
  const stepRepo = createStepRepository(db);
  const demoRepo = createDemoRepository(db);
  const workspaceRepo = createWorkspaceRepository(db);
  return createStepService({ stepRepo, demoRepo, workspaceRepo });
}
