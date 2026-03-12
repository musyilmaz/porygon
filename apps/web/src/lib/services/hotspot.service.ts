import {
  createDemoRepository,
  createHotspotRepository,
  createStepRepository,
  createWorkspaceRepository,
  getDb,
} from "@porygon/db";
import { createHotspotService } from "@porygon/services";

export function getHotspotService() {
  const db = getDb();
  return createHotspotService({
    hotspotRepo: createHotspotRepository(db),
    stepRepo: createStepRepository(db),
    demoRepo: createDemoRepository(db),
    workspaceRepo: createWorkspaceRepository(db),
  });
}
