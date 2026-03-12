import {
  createDemoRepository,
  createHotspotRepository,
  createStepRepository,
  createWorkspaceRepository,
  getDb,
} from "@repo/db";
import { createHotspotService } from "@repo/services";

export function getHotspotService() {
  const db = getDb();
  return createHotspotService({
    hotspotRepo: createHotspotRepository(db),
    stepRepo: createStepRepository(db),
    demoRepo: createDemoRepository(db),
    workspaceRepo: createWorkspaceRepository(db),
  });
}
