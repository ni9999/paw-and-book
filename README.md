# Pawnets Owner Console

Pawnets is a React + Vite owner console backed by an Express API for running a Riverside pet-services branch. The app includes the dashboard cockpit, weekly calendar, jobs board, customer search, retail inventory, staff performance, service catalog, and reports.

## Run the website

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the Express API

In the first terminal:

```bash
PORT=5000 pnpm --filter @workspace/api-server run dev
```

The API is available at `http://localhost:5000/api`.

### 3. Start the React frontend

In a second terminal:

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/paw-and-book run dev
```

Open the local URL printed by Vite. In the Replit workspace, use the `artifacts/paw-and-book: web` workflow so the shared proxy supplies the correct route prefix automatically.

## Useful commands

```bash
# Check all TypeScript packages
pnpm run typecheck

# Build the frontend
pnpm --filter @workspace/paw-and-book run build

# Check the API package
pnpm --filter @workspace/api-server run typecheck

# Regenerate typed API hooks after changing the contract
pnpm --filter @workspace/api-spec run codegen
```

## Project structure

- `artifacts/paw-and-book` — React frontend and Vite app
- `artifacts/api-server` — Express API routes and demo data
- `lib/api-spec/openapi.yaml` — source API contract
- `lib/api-client-react` — generated React Query hooks
- `lib/api-zod` — generated request and response validation schemas
- `reference.html` — original uploaded Paw&Book prototype

The API uses the fixture in `artifacts/api-server/data/db.json` as a small JSON-backed data store. Changes such as job status updates, staff/service edits, and draft purchase orders are persisted to that file and returned in the standard `{ success, data }` response envelope. The React client unwraps that envelope while retaining the existing console UI contract.