import {
  createDemoRepository,
  createStepRepository,
  createWorkspaceRepository,
  getDb,
} from "@porygon/db";
import { createStorageService, createUploadService } from "@porygon/services";

export function getStorageService() {
  return createStorageService({
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.R2_BUCKET_NAME!,
    publicUrl: "/api/storage",
  });
}

export function getUploadService() {
  const db = getDb();
  const workspaceRepo = createWorkspaceRepository(db);
  const demoRepo = createDemoRepository(db);
  const stepRepo = createStepRepository(db);
  const storageService = getStorageService();
  return createUploadService({ workspaceRepo, demoRepo, stepRepo, storageService });
}
