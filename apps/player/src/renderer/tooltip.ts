import type { TooltipPosition } from "@porygon/shared";

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
  attrs?: Record<string, unknown>;
}

interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export function tiptapToHTML(node: TipTapNode): string {
  if (node.type === "text") {
    let html = escapeHTML(node.text ?? "");
    if (node.marks) {
      for (const mark of node.marks) {
        html = wrapMark(html, mark);
      }
    }
    return html;
  }

  const children = node.content
    ? node.content.map((child) => tiptapToHTML(child)).join("")
    : "";

  switch (node.type) {
    case "doc":
      return children;
    case "paragraph":
      return `<p>${children}</p>`;
    case "heading": {
      const level = Math.min(Math.max(Number(node.attrs?.level) || 1, 1), 6);
      return `<h${level}>${children}</h${level}>`;
    }
    case "bulletList":
      return `<ul>${children}</ul>`;
    case "orderedList":
      return `<ol>${children}</ol>`;
    case "listItem":
      return `<li>${children}</li>`;
    default:
      return children;
  }
}

function wrapMark(html: string, mark: TipTapMark): string {
  switch (mark.type) {
    case "bold":
      return `<strong>${html}</strong>`;
    case "italic":
      return `<em>${html}</em>`;
    case "link": {
      const href = escapeAttr(String(mark.attrs?.href ?? "#"));
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${html}</a>`;
    }
    default:
      return html;
  }
}

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(text: string): string {
  return text.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export interface TooltipPositionResult {
  left: string;
  top: string;
}

export function calculateTooltipPosition(
  hotspotRect: DOMRect,
  tooltipEl: HTMLElement,
  containerRect: DOMRect,
  position: TooltipPosition,
): TooltipPositionResult {
  const tooltipWidth = tooltipEl.offsetWidth;
  const tooltipHeight = tooltipEl.offsetHeight;
  const gap = 8;

  const hotspotCenterX =
    hotspotRect.left - containerRect.left + hotspotRect.width / 2;
  const hotspotCenterY =
    hotspotRect.top - containerRect.top + hotspotRect.height / 2;

  let left: number;
  let top: number;

  switch (position) {
    case "top":
      left = hotspotCenterX - tooltipWidth / 2;
      top = hotspotRect.top - containerRect.top - tooltipHeight - gap;
      break;
    case "bottom":
      left = hotspotCenterX - tooltipWidth / 2;
      top = hotspotRect.bottom - containerRect.top + gap;
      break;
    case "left":
      left = hotspotRect.left - containerRect.left - tooltipWidth - gap;
      top = hotspotCenterY - tooltipHeight / 2;
      break;
    case "right":
      left = hotspotRect.right - containerRect.left + gap;
      top = hotspotCenterY - tooltipHeight / 2;
      break;
  }

  // Clamp within container bounds
  left = Math.max(0, Math.min(left, containerRect.width - tooltipWidth));
  top = Math.max(0, Math.min(top, containerRect.height - tooltipHeight));

  return { left: `${left}px`, top: `${top}px` };
}
