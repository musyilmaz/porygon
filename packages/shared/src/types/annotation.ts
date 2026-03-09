export type AnnotationType = "blur" | "crop" | "highlight";

export interface AnnotationSettings {
  blurIntensity?: number;
  highlightColor?: string;
  highlightOpacity?: number;
}

export interface Annotation {
  id: string;
  stepId: string;
  type: AnnotationType;
  x: number;
  y: number;
  width: number;
  height: number;
  settings: AnnotationSettings;
}
