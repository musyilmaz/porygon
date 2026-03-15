import {
  createAnnotationRepository,
  createDemoRepository,
  createHotspotRepository,
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
  const hotspotRepo = createHotspotRepository(db);
  const annotationRepo = createAnnotationRepository(db);
  return createStepService({
    stepRepo,
    demoRepo,
    workspaceRepo,
    hotspotRepo,
    annotationRepo,
  });
}
