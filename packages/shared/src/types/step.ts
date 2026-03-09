export type ActionType = "click" | "scroll" | "type" | "navigation";

export interface Coordinates {
  x: number;
  y: number;
}

export interface Step {
  id: string;
  demoId: string;
  orderIndex: number;
  screenshotUrl: string;
  actionType: ActionType;
  actionCoordinates: Coordinates | null;
  createdAt: Date;
}
