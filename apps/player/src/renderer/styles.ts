const STYLE_ID = "data-porygon-player";

let refCount = 0;
let styleElement: HTMLStyleElement | null = null;

export function generateCSS(brandColor: string = "#4f46e5"): string {
  return `
.porygon-player {
  --porygon-brand-color: ${brandColor};
  position: relative;
  display: inline-block;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
  outline: none;
}

.porygon-player *, .porygon-player *::before, .porygon-player *::after {
  box-sizing: border-box;
}

.porygon-player-viewport {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.porygon-player-screenshot {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  -webkit-user-drag: none;
}

.porygon-player-annotation-layer,
.porygon-player-hotspot-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.porygon-player-hotspot-layer {
  pointer-events: auto;
}

.porygon-player-hotspot {
  position: absolute;
  cursor: pointer;
  border-radius: 4px;
  transition: opacity 0.2s ease;
}

.porygon-player-hotspot:hover {
  opacity: 0.8;
}

.porygon-player-hotspot--pulse {
  animation: porygon-pulse 2s ease-in-out infinite;
}

@keyframes porygon-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(79, 70, 229, 0); }
}

.porygon-player-annotation {
  position: absolute;
  pointer-events: none;
}

.porygon-player-annotation--blur {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.porygon-player-annotation--highlight {
  border-radius: 2px;
}

.porygon-player-tooltip {
  position: absolute;
  z-index: 10;
  max-width: 300px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  color: #1f2937;
  pointer-events: auto;
}

.porygon-player-tooltip--hidden {
  display: none;
}

.porygon-player-tooltip p {
  margin: 0 0 8px 0;
}

.porygon-player-tooltip p:last-child {
  margin-bottom: 0;
}

.porygon-player-tooltip h1,
.porygon-player-tooltip h2,
.porygon-player-tooltip h3 {
  margin: 0 0 8px 0;
  font-weight: 600;
}

.porygon-player-tooltip h1 { font-size: 20px; }
.porygon-player-tooltip h2 { font-size: 18px; }
.porygon-player-tooltip h3 { font-size: 16px; }

.porygon-player-tooltip ul,
.porygon-player-tooltip ol {
  margin: 0 0 8px 0;
  padding-left: 20px;
}

.porygon-player-tooltip li {
  margin-bottom: 4px;
}

.porygon-player-tooltip a {
  color: var(--porygon-brand-color);
  text-decoration: underline;
}

.porygon-player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.porygon-player-prev,
.porygon-player-next {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  color: #374151;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.porygon-player-prev:hover:not(:disabled),
.porygon-player-next:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.porygon-player-prev:disabled,
.porygon-player-next:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.porygon-player-prev svg,
.porygon-player-next svg {
  width: 16px;
  height: 16px;
}

.porygon-player-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
}

.porygon-player-progress span {
  white-space: nowrap;
}

.porygon-player-progress-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.porygon-player-progress-fill {
  height: 100%;
  background: var(--porygon-brand-color);
  border-radius: 2px;
  transition: width 0.3s ease;
}
`.trim();
}

export function injectStyles(brandColor?: string): void {
  refCount++;
  if (styleElement) return;

  styleElement = document.createElement("style");
  styleElement.setAttribute(STYLE_ID, "");
  styleElement.textContent = generateCSS(brandColor);
  document.head.appendChild(styleElement);
}

export function removeStyles(): void {
  refCount--;
  if (refCount > 0) return;

  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }
  refCount = 0;
}

/** Reset internal state — for testing only */
export function _resetStyleState(): void {
  refCount = 0;
  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }
}
