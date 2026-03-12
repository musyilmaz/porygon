import {
  createAnalyticsRepository,
  createDemoRepository,
  getDb,
} from "@porygon/db";
import { createAnalyticsService } from "@porygon/services";

export function getAnalyticsService() {
  const db = getDb();
  const analyticsRepo = createAnalyticsRepository(db);
  const demoRepo = createDemoRepository(db);
  return createAnalyticsService({ analyticsRepo, demoRepo });
}
