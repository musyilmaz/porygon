import type { createDemoRepository } from "@porygon/db";

type DemoRepo = ReturnType<typeof createDemoRepository>;

export type DemoWithStats = Awaited<
  ReturnType<DemoRepo["listWithStats"]>
>[number];
