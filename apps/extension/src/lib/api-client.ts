const APP_URL = import.meta.env.WXT_APP_URL;

export class AuthRequiredError extends Error {
  constructor() {
    super("Not logged in. Please sign in to Porygon first.");
    this.name = "AuthRequiredError";
  }
}

export async function getSessionCookie(): Promise<string | null> {
  // Try HTTPS cookie first (production), then HTTP cookie (dev)
  const cookieNames = [
    "__Secure-better-auth.session_token",
    "better-auth.session_token",
  ];

  for (const name of cookieNames) {
    const cookie = await browser.cookies.get({ url: APP_URL, name });
    if (cookie) {
      return `${cookie.name}=${cookie.value}`;
    }
  }

  return null;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookie = await getSessionCookie();
  if (!cookie) {
    throw new AuthRequiredError();
  }

  const url = `${APP_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    throw new AuthRequiredError();
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface Demo {
  id: string;
  title: string;
  slug: string;
  workspaceId: string;
}

interface Step {
  id: string;
  demoId: string;
  orderIndex: number;
  screenshotUrl: string | null;
}

interface UploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

export function getWorkspaces(): Promise<Workspace[]> {
  return apiFetch<Workspace[]>("/api/workspaces");
}

export function createDemo(input: {
  title: string;
  workspaceId: string;
}): Promise<Demo> {
  return apiFetch<Demo>("/api/demos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createStep(
  demoId: string,
  input: {
    actionType?: string;
    actionCoordinates?: { x: number; y: number } | null;
  },
): Promise<Step> {
  return apiFetch<Step>(`/api/demos/${demoId}/steps`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getUploadUrl(input: {
  workspaceId: string;
  demoId: string;
  stepId: string;
  contentType: "image/webp" | "image/png";
}): Promise<UploadUrlResponse> {
  return apiFetch<UploadUrlResponse>("/api/uploads", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateStep(
  demoId: string,
  stepId: string,
  input: { screenshotUrl: string },
): Promise<Step> {
  return apiFetch<Step>(`/api/demos/${demoId}/steps/${stepId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
