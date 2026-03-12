# Porygon — Interactive Demo Platform

## What This Is

Porygon is an interactive demo builder for B2B SaaS teams. Capture product walkthroughs, edit with hotspots and tooltips, share and embed anywhere. Competing with Arcade.software with better pricing and execution.

## Strategy & Planning Docs

All research, PRD, market analysis, roadmap, and strategy documents live in:
`/Users/musyilmaz/Documents/projects/interactive-demo-platform/`

Refer to those docs for context on product decisions, competitive landscape, and roadmap.

Key files:

- `strategy/roadmap.md` — 49 development tickets across 10 cycles
- `strategy/tech-stack.md` — Full architecture, DB schema, testing strategy
- `strategy/prd.md` — Product requirements (P0/P1/P2)
- `strategy/positioning.md` — Product positioning and messaging

## Architecture

Turborepo monorepo. Next.js 15 with Route Handlers. Services fully separated.

```
porygon/
├── apps/
│   ├── web/              # Next.js 15 — dashboard, editor, landing page, API routes
│   ├── player/           # Vanilla TS — embeddable demo player widget (<50KB)
│   └── extension/        # Chrome Extension (WXT + React, Manifest V3)
├── packages/
│   ├── services/         # ALL business logic (demo, step, hotspot, analytics, workspace, storage)
│   ├── db/               # Drizzle ORM schema, migrations, repositories
│   ├── shared/           # Types, Zod validators, constants, utilities
│   ├── ui/               # Shared React components (shadcn/ui based)
│   └── auth/             # Better Auth configuration
└── tooling/
    ├── eslint/           # Shared ESLint config
    ├── typescript/       # Shared tsconfig
    └── vitest/           # Shared vitest config
```

## Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind v4, shadcn/ui
- **Editor**: Konva.js (react-konva), Zustand, Tiptap, dnd-kit
- **Backend**: Next.js Route Handlers (thin wrappers calling services)
- **Auth**: Better Auth (DB-backed sessions, Drizzle adapter)
- **Database**: PostgreSQL via Neon, Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible, presigned uploads)
- **Player**: Vanilla TypeScript, tsup build, <50KB
- **Extension**: WXT framework, Manifest V3, React
- **Testing**: Vitest, testcontainers (real Postgres for DB tests)
- **CI**: GitHub Actions

## Key Patterns

### Service Layer (CRITICAL)

Route handlers are THIN wrappers. All business logic lives in `packages/services/`.
Services use dependency injection — accept repositories as constructor args.

```ts
// YES — thin route handler
const demoService = createDemoService({ demoRepo })
export async function POST(req: Request) {
  const session = await getSession(req)
  const body = createDemoSchema.parse(await req.json())
  const demo = await demoService.create(body, session.user.id)
  return Response.json(demo, { status: 201 })
}

// NO — business logic in route handler
export async function POST(req: Request) {
  const count = await db.select()... // DON'T do this here
}
```

### Testing

- Services: unit tests with mock repositories (90%+ coverage)
- Repositories: integration tests with testcontainers (real Postgres)
- Validators: unit tests (95%+ coverage)
- Player: unit tests on navigation logic
- Route handlers: minimal testing (logic tested via services)

### Error Handling

Use custom error types from `@porygon/shared`: NotFoundError, ForbiddenError, ValidationError, LimitExceededError, ConflictError, UnauthorizedError.

## Linear Integration

Tickets tracked in Linear. NEVER interact with super.ai Linear workspace.

<!-- Linear team ID and project ID will be added once connected -->

## Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all packages and apps
pnpm test             # Run all tests
pnpm test:unit        # Unit tests only (services, shared, player)
pnpm test:integration # Integration tests (db with testcontainers)
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript check all packages
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio
```
