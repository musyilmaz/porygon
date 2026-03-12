import {
  createDemoRepository,
  createStepRepository,
  createWorkspaceRepository,
  getDb,
} from "@repo/db";
import { createStorageService, createUploadService } from "@repo/services";

export function getUploadService() {
  const db = getDb();
  const workspaceRepo = createWorkspaceRepository(db);
  const demoRepo = createDemoRepository(db);
  const stepRepo = createStepRepository(db);
  const storageService = createStorageService({
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.R2_BUCKET_NAME!,
    publicUrl: process.env.R2_PUBLIC_URL!,
  });
  return createUploadService({ workspaceRepo, demoRepo, stepRepo, storageService });
}
