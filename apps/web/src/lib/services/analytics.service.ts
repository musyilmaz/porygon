import {
  createAnalyticsRepository,
  createDemoRepository,
  getDb,
} from "@repo/db";
import { createAnalyticsService } from "@repo/services";

export function getAnalyticsService() {
  const db = getDb();
  const analyticsRepo = createAnalyticsRepository(db);
  const demoRepo = createDemoRepository(db);
  return createAnalyticsService({ analyticsRepo, demoRepo });
}
