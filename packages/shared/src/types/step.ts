export type ActionType = "click" | "scroll" | "type" | "navigation";

export type MediaType = "image" | "video";

export interface Coordinates {
  x: number;
  y: number;
}

export interface Step {
  id: string;
  demoId: string;
  orderIndex: number;
  screenshotUrl: string;
  mediaType: MediaType;
  videoUrl: string | null;
  actionType: ActionType;
  actionCoordinates: Coordinates | null;
  createdAt: Date;
}
