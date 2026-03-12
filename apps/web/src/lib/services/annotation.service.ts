import {
  createAnnotationRepository,
  createDemoRepository,
  createStepRepository,
  createWorkspaceRepository,
  getDb,
} from "@porygon/db";
import { createAnnotationService } from "@porygon/services";

export function getAnnotationService() {
  const db = getDb();
  return createAnnotationService({
    annotationRepo: createAnnotationRepository(db),
    stepRepo: createStepRepository(db),
    demoRepo: createDemoRepository(db),
    workspaceRepo: createWorkspaceRepository(db),
  });
}
