const logos = [
  "Vertex",
  "Payload",
  "Orbital",
  "Kernel",
  "Fieldwire",
  "Glassline",
  "North",
  "Zenith",
];

export function LogoWall() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-12 sm:px-12">
      <div className="mono-label mb-8 text-center">
        TRUSTED BY 3,400+ GTM TEAMS
      </div>
      <div className="grid grid-cols-4 items-center gap-8 md:grid-cols-8">
        {logos.map((logo) => (
          <div
            key={logo}
            className="text-center font-display text-[20px] font-semibold tracking-[-0.03em] text-ink-400"
          >
            {logo}
          </div>
        ))}
      </div>
    </section>
  );
}
