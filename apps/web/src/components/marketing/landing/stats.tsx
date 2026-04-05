export function Stats() {
  return (
    <section className="border-b py-12">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-8 px-4 text-center sm:gap-16 sm:px-6">
        <div>
          <div className="text-2xl font-bold tracking-tight">$20/mo</div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            Flat — not per seat
          </div>
        </div>
        <div className="hidden h-8 w-px bg-border sm:block" />
        <div>
          <div className="text-2xl font-bold tracking-tight">10</div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            Free demos, no watermark
          </div>
        </div>
        <div className="hidden h-8 w-px bg-border sm:block" />
        <div>
          <div className="text-2xl font-bold tracking-tight">&lt;3 min</div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            To your first demo
          </div>
        </div>
      </div>
    </section>
  );
}
