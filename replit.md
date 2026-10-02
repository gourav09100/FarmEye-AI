# FarmEye AI

An AI-powered farming companion for crop health, weather awareness, practical farming guidance, farm expenses, and crop records.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/farmeye-ai/` — FarmEye AI React web application.
- `artifacts/farmeye-ai/src/` — application routes, reusable UI, and styles.
- `artifacts/api-server/` and `lib/api-spec/` — shared API foundation, available for future connected services.

## Architecture decisions

- Initial farmer-facing data is demo data and is stored in the browser; no AI, weather, or Supabase service is connected.
- Keep integration points behind data adapters so future services can replace demo providers without tying UI components directly to vendors.

## Product

FarmEye AI gives farmers one place to review their crops and field conditions, explore preliminary crop-health guidance, ask farming questions, track expenses, and revisit crop history.

## User preferences

- Use a professional, modern agricultural visual identity and make the interface work well on phones.
- Be transparent that crop analysis is preliminary and not a replacement for agricultural expert advice.
- Do not claim AI diagnosis is completely accurate.
- Do not use paid services; keep disconnected APIs represented by mock data.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
