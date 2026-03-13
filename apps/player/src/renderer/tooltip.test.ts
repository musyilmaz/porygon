// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

import { tiptapToHTML, calculateTooltipPosition } from "./tooltip";

describe("tiptapToHTML", () => {
  it("converts a simple paragraph", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello world" }],
        },
      ],
    };
    expect(tiptapToHTML(doc)).toBe("<p>Hello world</p>");
  });

  it("converts bold text", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "bold text",
              marks: [{ type: "bold" }],
            },
          ],
        },
      ],
    };
    expect(tiptapToHTML(doc)).toBe("<p><strong>bold text</strong></p>");
  });

  it("converts italic text", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "italic",
              marks: [{ type: "italic" }],
            },
          ],
        },
      ],
    };
    expect(tiptapToHTML(doc)).toBe("<p><em>italic</em></p>");
  });

  it("converts links", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "click here",
              marks: [
                { type: "link", attrs: { href: "https://example.com" } },
              ],
            },
          ],
        },
      ],
    };
    const html = tiptapToHTML(doc);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("click here</a>");
  });

  it("converts headings with level", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Title" }],
        },
      ],
    };
    expect(tiptapToHTML(doc)).toBe("<h2>Title</h2>");
  });

  it("defaults heading level to 1", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "heading",
          content: [{ type: "text", text: "Title" }],
        },
      ],
    };
    expect(tiptapToHTML(doc)).toBe("<h1>Title</h1>");
  });

  it("converts bullet lists", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Item 1" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Item 2" }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(tiptapToHTML(doc)).toBe(
      "<ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul>",
    );
  });

  it("converts ordered lists", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "First" }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(tiptapToHTML(doc)).toBe("<ol><li><p>First</p></li></ol>");
  });

  it("handles multiple marks on same text", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "bold italic",
              marks: [{ type: "bold" }, { type: "italic" }],
            },
          ],
        },
      ],
    };
    expect(tiptapToHTML(doc)).toBe(
      "<p><em><strong>bold italic</strong></em></p>",
    );
  });

  it("escapes HTML in text content", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: '<script>alert("xss")</script>' }],
        },
      ],
    };
    const html = tiptapToHTML(doc);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("handles empty doc", () => {
    expect(tiptapToHTML({ type: "doc" })).toBe("");
  });

  it("handles unknown node types by rendering children", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "unknownBlock",
          content: [{ type: "text", text: "content" }],
        },
      ],
    };
    expect(tiptapToHTML(doc)).toBe("content");
  });
});

describe("calculateTooltipPosition", () => {
  function makeRect(
    x: number,
    y: number,
    width: number,
    height: number,
  ): DOMRect {
    return {
      x,
      y,
      width,
      height,
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
      toJSON: () => ({}),
    };
  }

  function makeTooltipEl(width: number, height: number): HTMLElement {
    const el = document.createElement("div");
    Object.defineProperty(el, "offsetWidth", { value: width });
    Object.defineProperty(el, "offsetHeight", { value: height });
    return el;
  }

  it("positions tooltip above hotspot (top)", () => {
    const hotspotRect = makeRect(200, 300, 100, 40);
    const containerRect = makeRect(0, 0, 1000, 800);
    const tooltip = makeTooltipEl(200, 80);

    const result = calculateTooltipPosition(
      hotspotRect,
      tooltip,
      containerRect,
      "top",
    );

    // Centered: hotspotCenter (250) - tooltipWidth/2 (100) = 150
    expect(result.left).toBe("150px");
    // Above: hotspotTop (300) - tooltipHeight (80) - gap (8) = 212
    expect(result.top).toBe("212px");
  });

  it("positions tooltip below hotspot (bottom)", () => {
    const hotspotRect = makeRect(200, 100, 100, 40);
    const containerRect = makeRect(0, 0, 1000, 800);
    const tooltip = makeTooltipEl(200, 80);

    const result = calculateTooltipPosition(
      hotspotRect,
      tooltip,
      containerRect,
      "bottom",
    );

    expect(result.left).toBe("150px");
    // Below: hotspotBottom (140) + gap (8) = 148
    expect(result.top).toBe("148px");
  });

  it("positions tooltip to the left of hotspot", () => {
    const hotspotRect = makeRect(500, 300, 100, 40);
    const containerRect = makeRect(0, 0, 1000, 800);
    const tooltip = makeTooltipEl(200, 80);

    const result = calculateTooltipPosition(
      hotspotRect,
      tooltip,
      containerRect,
      "left",
    );

    // Left: hotspotLeft (500) - tooltipWidth (200) - gap (8) = 292
    expect(result.left).toBe("292px");
    // Centered vertically: hotspotCenter (320) - tooltipHeight/2 (40) = 280
    expect(result.top).toBe("280px");
  });

  it("positions tooltip to the right of hotspot", () => {
    const hotspotRect = makeRect(200, 300, 100, 40);
    const containerRect = makeRect(0, 0, 1000, 800);
    const tooltip = makeTooltipEl(200, 80);

    const result = calculateTooltipPosition(
      hotspotRect,
      tooltip,
      containerRect,
      "right",
    );

    // Right: hotspotRight (300) + gap (8) = 308
    expect(result.left).toBe("308px");
    expect(result.top).toBe("280px");
  });

  it("clamps tooltip within container bounds", () => {
    // Hotspot near top-left — tooltip would go negative
    const hotspotRect = makeRect(10, 10, 50, 30);
    const containerRect = makeRect(0, 0, 500, 400);
    const tooltip = makeTooltipEl(200, 80);

    const result = calculateTooltipPosition(
      hotspotRect,
      tooltip,
      containerRect,
      "top",
    );

    // Left would be negative, clamped to 0
    expect(result.left).toBe("0px");
    // Top would be negative, clamped to 0
    expect(result.top).toBe("0px");
  });

  it("accounts for container offset", () => {
    const hotspotRect = makeRect(300, 400, 100, 40);
    const containerRect = makeRect(100, 100, 1000, 800);
    const tooltip = makeTooltipEl(200, 80);

    const result = calculateTooltipPosition(
      hotspotRect,
      tooltip,
      containerRect,
      "bottom",
    );

    // hotspotCenter relative to container: (300-100) + 50 = 250
    // left = 250 - 100 = 150
    expect(result.left).toBe("150px");
    // hotspotBottom relative to container: (400-100) + 40 = 340
    // top = 340 + 8 = 348
    expect(result.top).toBe("348px");
  });
});
