import { Camera, Pencil, Share2 } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Capture",
    description:
      "Install the Chrome extension. Click to start capturing. Every click becomes a step.",
    icon: Camera,
  },
  {
    number: "2",
    title: "Edit",
    description:
      "Add interactive hotspots, tooltips, and annotations. Crop, blur, and reorder steps.",
    icon: Pencil,
  },
  {
    number: "3",
    title: "Share",
    description:
      "Get a shareable link or embed code. Track views and engagement.",
    icon: Share2,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Three steps. No learning curve.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                <step.icon className="size-6" />
              </div>
              <div className="mt-1 text-sm font-medium text-violet-600">
                Step {step.number}
              </div>
              <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
