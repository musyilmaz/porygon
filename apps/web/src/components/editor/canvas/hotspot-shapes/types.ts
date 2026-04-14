import type { EditorHotspot } from "@/stores/editor/types";

export interface HotspotShapeProps {
  hotspot: EditorHotspot;
  isSelected: boolean;
  isSelectMode: boolean;
  onSelect: (hotspotId: string) => void;
  onDragEnd: (hotspotId: string, x: number, y: number) => void;
  onTransformEnd: (
    hotspotId: string,
    attrs: { x: number; y: number; width: number; height: number },
  ) => void;
}
