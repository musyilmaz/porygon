import {
  createAnnotationRepository,
  createDemoRepository,
  createStepRepository,
  createWorkspaceRepository,
  getDb,
} from "@repo/db";
import { createAnnotationService } from "@repo/services";

export function getAnnotationService() {
  const db = getDb();
  return createAnnotationService({
    annotationRepo: createAnnotationRepository(db),
    stepRepo: createStepRepository(db),
    demoRepo: createDemoRepository(db),
    workspaceRepo: createWorkspaceRepository(db),
  });
}
