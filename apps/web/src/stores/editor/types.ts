import type { DemoStatus, Nullable } from "@porygon/shared";

// Editor types match what the DB/service layer actually returns.
// jsonb columns come back as Record<string, unknown>, not the stricter
// shared interfaces (DemoSettings, HotspotStyle, etc.).

export interface EditorHotspot {
  id: string;
  stepId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetStepId: Nullable<string>;
  tooltipContent: Nullable<Record<string, unknown>>;
  tooltipPosition: string;
  style: Nullable<Record<string, unknown>>;
}

export interface EditorAnnotation {
  id: string;
  stepId: string;
  type: "blur" | "crop" | "highlight";
  x: number;
  y: number;
  width: number;
  height: number;
  settings: Nullable<Record<string, unknown>>;
}

export interface EditorStep {
  id: string;
  demoId: string;
  orderIndex: number;
  screenshotUrl: Nullable<string>;
  actionType: Nullable<"click" | "scroll" | "type" | "navigation">;
  actionCoordinates: Nullable<Record<string, unknown>>;
  hotspots: EditorHotspot[];
  annotations: EditorAnnotation[];
}

export interface EditorDemo {
  title: string;
  description: Nullable<string>;
  slug: string;
  status: DemoStatus;
  settings: Nullable<Record<string, unknown>>;
}

export type ActiveTool = "select" | "hotspot" | "blur" | "crop" | "highlight";

export interface EditorState {
  demoId: string;
  workspaceId: string;
  demo: EditorDemo;
  steps: EditorStep[];

  selectedStepIndex: number;
  selectedHotspotId: Nullable<string>;
  selectedAnnotationId: Nullable<string>;

  activeTool: ActiveTool;

  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;

  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Nullable<Date>;
  saveError: Nullable<string>;
}

export interface EditorActions {
  // Demo
  updateDemo: (updates: Partial<EditorDemo>) => void;

  // Steps
  selectStep: (index: number) => void;
  addStep: (step: EditorStep) => void;
  insertStep: (step: EditorStep, atIndex: number) => void;
  removeStep: (stepId: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  updateStep: (
    stepId: string,
    updates: Partial<
      Omit<EditorStep, "id" | "demoId" | "hotspots" | "annotations">
    >,
  ) => void;

  // Hotspots
  addHotspot: (stepId: string, hotspot: EditorHotspot) => void;
  updateHotspot: (
    stepId: string,
    hotspotId: string,
    updates: Partial<Omit<EditorHotspot, "id" | "stepId">>,
  ) => void;
  removeHotspot: (stepId: string, hotspotId: string) => void;
  selectHotspot: (hotspotId: Nullable<string>) => void;

  // Annotations
  addAnnotation: (stepId: string, annotation: EditorAnnotation) => void;
  updateAnnotation: (
    stepId: string,
    annotationId: string,
    updates: Partial<Omit<EditorAnnotation, "id" | "stepId">>,
  ) => void;
  removeAnnotation: (stepId: string, annotationId: string) => void;
  selectAnnotation: (annotationId: Nullable<string>) => void;

  // Tools & UI
  setTool: (tool: ActiveTool) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;

  // Save state
  markDirty: () => void;
  setSaving: (isSaving: boolean) => void;
  setSaved: () => void;
  setSaveError: (error: Nullable<string>) => void;
}

export type EditorStore = EditorState & EditorActions;

export interface EditorInitialData {
  demoId: string;
  workspaceId: string;
  demo: EditorDemo;
  steps: EditorStep[];
}
