import { createDemoRepository, getDb } from "@porygon/db";
import { createPublicDemoService } from "@porygon/services";

export function getPublicDemoService() {
  const db = getDb();
  const demoRepo = createDemoRepository(db);
  return createPublicDemoService({ demoRepo });
}
