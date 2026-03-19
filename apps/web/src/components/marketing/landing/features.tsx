import {
  BarChart3,
  Chrome,
  MousePointerClick,
  Palette,
  Share2,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "Capture in one click",
    description:
      "Install the extension. Navigate your product. Every click becomes a step.",
    icon: Chrome,
  },
  {
    title: "Guide your audience",
    description:
      "Add clickable hotspots and rich tooltips to walk users through your product.",
    icon: MousePointerClick,
  },
  {
    title: "Your brand, your demo",
    description:
      "Add your logo and colors. Available on all plans, including Pro.",
    icon: Palette,
  },
  {
    title: "Put demos everywhere",
    description: "Share links, embed on your site, or add to sales emails.",
    icon: Share2,
  },
  {
    title: "Know what works",
    description: "Track views, completion rates, and drop-off points.",
    icon: BarChart3,
  },
  {
    title: "Clean and professional",
    description:
      'No watermarks, even on the free plan. No "Made with..." badges on your demos.',
    icon: Sparkles,
  },
];

export function Features() {
  return (
    <section id="features" className="border-t bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Powerful features without the complexity.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-background p-6 shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
