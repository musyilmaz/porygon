import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface StorageServiceConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

const CONTENT_TYPE_EXTENSIONS: Record<string, string> = {
  "image/webp": ".webp",
  "image/png": ".png",
  "video/webm": ".webm",
};

export function storageKey(
  workspaceId: string,
  demoId: string,
  stepId: string,
  contentType: string = "image/webp",
): string {
  const ext = CONTENT_TYPE_EXTENSIONS[contentType] ?? ".webp";
  return `${workspaceId}/${demoId}/${stepId}${ext}`;
}

export function createStorageService({
  accountId,
  accessKeyId,
  secretAccessKey,
  bucketName,
  publicUrl,
}: StorageServiceConfig) {
  const base = publicUrl.replace(/\/+$/, "");

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return {
    async generateUploadUrl(
      key: string,
      contentType?: string,
    ): Promise<string> {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ...(contentType && { ContentType: contentType }),
      });
      return getSignedUrl(client, command, { expiresIn: 300 });
    },

    generateDownloadUrl(key: string): string {
      return `${base}/${key}`;
    },

    async getFile(key: string) {
      const response = await client.send(
        new GetObjectCommand({ Bucket: bucketName, Key: key }),
      );
      const bytes = await response.Body!.transformToByteArray();
      return {
        bytes,
        contentType: response.ContentType ?? "application/octet-stream",
      };
    },

    async deleteFile(key: string): Promise<void> {
      await client.send(
        new DeleteObjectCommand({ Bucket: bucketName, Key: key }),
      );
    },

    async deleteFiles(keys: string[]): Promise<void> {
      if (keys.length === 0) return;
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: { Objects: keys.map((k) => ({ Key: k })) },
        }),
      );
    },
  };
}
