import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/services",
  "packages/db",
  "packages/shared",
  "apps/player",
]);
