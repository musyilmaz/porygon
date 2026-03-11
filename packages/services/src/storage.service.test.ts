import { describe, expect, it } from "vitest";

import { createStorageService, storageKey } from "./storage.service";

const PUBLIC_URL = "https://cdn.example.com";

describe("createStorageService", () => {
  const storage = createStorageService({ publicUrl: PUBLIC_URL });

  describe("generateUploadUrl", () => {
    it("returns a URL containing the key", () => {
      const url = storage.generateUploadUrl("ws/demo/step.webp");
      expect(url).toContain("ws/demo/step.webp");
      expect(url).toContain(PUBLIC_URL);
    });

    it("accepts an optional content type", () => {
      const url = storage.generateUploadUrl("key.webp", "image/webp");
      expect(url).toContain("key.webp");
    });
  });

  describe("generateDownloadUrl", () => {
    it("returns a URL containing the key", () => {
      const url = storage.generateDownloadUrl("ws/demo/step.webp");
      expect(url).toContain("ws/demo/step.webp");
      expect(url).toContain(PUBLIC_URL);
    });
  });

  describe("deleteFile", () => {
    it("resolves without error", () => {
      expect(() => storage.deleteFile("ws/demo/step.webp")).not.toThrow();
    });
  });

  describe("deleteFiles", () => {
    it("resolves without error", () => {
      expect(() =>
        storage.deleteFiles(["a.webp", "b.webp"]),
      ).not.toThrow();
    });

    it("handles empty array without error", () => {
      expect(() => storage.deleteFiles([])).not.toThrow();
    });
  });
});

describe("storageKey", () => {
  it("produces correct format {workspaceId}/{demoId}/{stepId}.webp", () => {
    const key = storageKey("ws-123", "demo-456", "step-789");
    expect(key).toBe("ws-123/demo-456/step-789.webp");
  });
});
