export type DemoStatus = "draft" | "published" | "archived";

export interface DemoSettings {
  showProgressBar?: boolean;
  autoPlay?: boolean;
  autoPlayDelay?: number;
  showNavigation?: boolean;
  brandColor?: string;
}

export interface Demo {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  slug: string;
  status: DemoStatus;
  settings: DemoSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}
