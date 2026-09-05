# Pawnets Owner Console

An owner-facing React console and Express API for managing a pet-services branch.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/paw-and-book run dev` — run the React frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- No database or external credentials are required; the API persists fixture data to `artifacts/api-server/data/db.json`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Persistence: JSON fixture store with synchronous read/write helpers
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/paw-and-book` — React/Vite web app
- `artifacts/api-server/src/routes/paw-and-book.ts` — Express routes, validation, and audit logging
- `artifacts/api-server/data/db.json` — persistent branch fixture data
- `lib/api-spec/openapi.yaml` — API source of truth
- `reference.html` — original HTML prototype

## Architecture decisions

- The documented backend contract uses `{ success, data }` and `{ success, error }` envelopes. Keep the client unwrapping adapter in sync when response shapes change.
- The frontend uses generated React Query hooks instead of raw fetch calls.
- The first release uses a JSON-backed fixture so the owner console is immediately runnable without extra setup while mutations survive restarts.
- The original prototype is kept as `reference.html` for visual and content reference.

## Product

The console provides a dashboard cockpit, weekly calendar, operations jobs board, customer search, retail inventory, staff performance, service catalog, and reports. Key actions include completing attention items, changing job statuses, filtering schedules/customers, and creating draft purchase orders.

## User preferences

- Preserve the uploaded prototype as `reference.html`.

## Gotchas

- The frontend must run with `BASE_PATH` set; the managed artifact workflow supplies it automatically.
- The JSON fixture is intentionally small and local; it is not a replacement for a multi-user production database.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
