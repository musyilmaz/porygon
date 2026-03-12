import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createStorageService, storageKey } from "./storage.service";

vi.mock("@aws-sdk/client-s3", async () => {
  const actual =
    await vi.importActual<typeof import("@aws-sdk/client-s3")>(
      "@aws-sdk/client-s3",
    );
  return {
    ...actual,
    S3Client: vi.fn().mockImplementation(() => ({
      send: vi.fn().mockResolvedValue({}),
    })),
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi
    .fn()
    .mockResolvedValue("https://signed.example.com/upload?token=abc"),
}));

const CONFIG = {
  accountId: "test-account",
  accessKeyId: "test-key",
  secretAccessKey: "test-secret",
  bucketName: "test-bucket",
  publicUrl: "https://cdn.example.com",
};

describe("createStorageService", () => {
  let storage: ReturnType<typeof createStorageService>;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = createStorageService(CONFIG);
    const clientInstance = vi.mocked(S3Client).mock.results.at(-1)?.value;
    mockSend = clientInstance.send;
  });

  describe("generateUploadUrl", () => {
    it("creates a PutObjectCommand with correct bucket and key", async () => {
      const url = await storage.generateUploadUrl("ws/demo/step.webp");

      expect(url).toBe("https://signed.example.com/upload?token=abc");
      expect(getSignedUrl).toHaveBeenCalledOnce();

      const [client, command, options] = vi.mocked(getSignedUrl).mock
        .calls[0]!;
      expect(client).toBeDefined();
      expect(command).toBeInstanceOf(PutObjectCommand);
      expect((command as PutObjectCommand).input).toMatchObject({
        Bucket: "test-bucket",
        Key: "ws/demo/step.webp",
      });
      expect(options).toEqual({ expiresIn: 300 });
    });

    it("includes ContentType when provided", async () => {
      await storage.generateUploadUrl("key.webp", "image/webp");

      const command = vi.mocked(getSignedUrl).mock.calls[0]![1];
      expect((command as PutObjectCommand).input).toMatchObject({
        ContentType: "image/webp",
      });
    });

    it("omits ContentType when not provided", async () => {
      await storage.generateUploadUrl("key.webp");

      const command = vi.mocked(getSignedUrl).mock.calls[0]![1];
      expect((command as PutObjectCommand).input).not.toHaveProperty(
        "ContentType",
      );
    });
  });

  describe("generateDownloadUrl", () => {
    it("returns publicUrl + key without any S3 call", () => {
      const url = storage.generateDownloadUrl("ws/demo/step.webp");

      expect(url).toBe("https://cdn.example.com/ws/demo/step.webp");
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe("deleteFile", () => {
    it("sends a DeleteObjectCommand with correct bucket and key", async () => {
      await storage.deleteFile("ws/demo/step.webp");

      expect(mockSend).toHaveBeenCalledOnce();
      const command = mockSend.mock.calls[0]![0];
      expect(command).toBeInstanceOf(DeleteObjectCommand);
      expect(command.input).toMatchObject({
        Bucket: "test-bucket",
        Key: "ws/demo/step.webp",
      });
    });
  });

  describe("deleteFiles", () => {
    it("sends a DeleteObjectsCommand with correct keys", async () => {
      await storage.deleteFiles(["a.webp", "b.webp"]);

      expect(mockSend).toHaveBeenCalledOnce();
      const command = mockSend.mock.calls[0]![0];
      expect(command).toBeInstanceOf(DeleteObjectsCommand);
      expect(command.input).toMatchObject({
        Bucket: "test-bucket",
        Delete: { Objects: [{ Key: "a.webp" }, { Key: "b.webp" }] },
      });
    });

    it("does not call S3 for an empty array", async () => {
      await storage.deleteFiles([]);

      expect(mockSend).not.toHaveBeenCalled();
    });
  });
});

describe("storageKey", () => {
  it("produces correct format {workspaceId}/{demoId}/{stepId}.webp", () => {
    const key = storageKey("ws-123", "demo-456", "step-789");
    expect(key).toBe("ws-123/demo-456/step-789.webp");
  });
});
