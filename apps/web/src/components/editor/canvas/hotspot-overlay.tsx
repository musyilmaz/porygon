import { AreaShape, CalloutShape, ClickZoneShape } from "./hotspot-shapes";

import type { EditorHotspot } from "@/stores/editor/types";

interface HotspotOverlayProps {
  hotspots: EditorHotspot[];
  selectedHotspotId: string | null;
  activeTool: string;
  onSelect: (hotspotId: string) => void;
  onDragEnd: (hotspotId: string, x: number, y: number) => void;
  onTransformEnd: (
    hotspotId: string,
    attrs: { x: number; y: number; width: number; height: number },
  ) => void;
}

export function HotspotOverlay({
  hotspots,
  selectedHotspotId,
  activeTool,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: HotspotOverlayProps) {
  const isSelectMode = activeTool === "select";

  return (
    <>
      {hotspots.map((hotspot) => {
        const isSelected = selectedHotspotId === hotspot.id;
        const sharedProps = {
          hotspot,
          isSelected,
          isSelectMode,
          onSelect,
          onDragEnd,
          onTransformEnd,
        };

        switch (hotspot.type) {
          case "click_zone":
            return <ClickZoneShape key={hotspot.id} {...sharedProps} />;
          case "area":
            return <AreaShape key={hotspot.id} {...sharedProps} />;
          case "callout":
            return <CalloutShape key={hotspot.id} {...sharedProps} />;
          default:
            return <AreaShape key={hotspot.id} {...sharedProps} />;
        }
      })}
    </>
  );
}
