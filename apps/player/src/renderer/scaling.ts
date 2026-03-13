export function toPercent(value: number, naturalSize: number): number {
  if (naturalSize <= 0) return 0;
  return (value / naturalSize) * 100;
}

export function hotspotToPercentStyles(
  hotspot: { x: number; y: number; width: number; height: number },
  naturalWidth: number,
  naturalHeight: number,
): { left: string; top: string; width: string; height: string } {
  return {
    left: `${toPercent(hotspot.x, naturalWidth)}%`,
    top: `${toPercent(hotspot.y, naturalHeight)}%`,
    width: `${toPercent(hotspot.width, naturalWidth)}%`,
    height: `${toPercent(hotspot.height, naturalHeight)}%`,
  };
}
