import { createDemoRepository, getDb } from "@repo/db";
import { createPublicDemoService } from "@repo/services";

export function getPublicDemoService() {
  const db = getDb();
  const demoRepo = createDemoRepository(db);
  return createPublicDemoService({ demoRepo });
}
