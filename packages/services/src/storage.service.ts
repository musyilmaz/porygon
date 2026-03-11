interface StorageServiceConfig {
  publicUrl: string;
}

export function storageKey(
  workspaceId: string,
  demoId: string,
  stepId: string,
): string {
  return `${workspaceId}/${demoId}/${stepId}.webp`;
}

export function createStorageService({ publicUrl }: StorageServiceConfig) {
  const base = publicUrl.replace(/\/+$/, "");

  return {
    generateUploadUrl(key: string, _contentType?: string): string {
      return `${base}/upload/${key}?token=mock-token`;
    },

    generateDownloadUrl(key: string): string {
      return `${base}/${key}`;
    },

    deleteFile(_key: string): void {
      // no-op — mock implementation (see ATLAS-101 for real R2 integration)
    },

    deleteFiles(_keys: string[]): void {
      // no-op — mock implementation (see ATLAS-101 for real R2 integration)
    },
  };
}
