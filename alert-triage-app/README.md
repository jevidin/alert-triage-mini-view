# Alert Triage Mini-View

A small Next.js application for SOC analysts to triage security alerts: filter, sort, review details in a split-pane layout, and update alert status in memory. Includes a reference ASP.NET backend and SQL schema for production status updates.

## Features

- **~200 mock alerts** loaded from static JSON (`id`, `title`, `severity`, `status`, `source`, `createdAt`, `assignee`)
- **Sortable / filterable list** — severity, status, source, and free-text search across title, ID, and assignee
- **Split-pane layout** — list and detail panel side-by-side (no modal/drawer)
- **In-memory status updates** — single alert via detail panel dropdown
- **Bulk status update** — select multiple alerts and apply a status in one action
- **Keyboard navigation** — `↑`/`↓` or `j`/`k` to move selection, `Space` to toggle checkbox

### UX improvement: Bulk status update

**Rationale:** During alert floods, analysts need to dismiss or escalate dozens of related alerts in one action instead of opening each one individually.

## Quick start (frontend)

Requires **Node.js 20+** (Next.js 16).

```bash
cd alert-triage-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Regenerate mock data

```bash
node scripts/generate-alerts.mjs
```

## Project structure

```
alert-triage-app/     Next.js frontend
  app/                App Router pages and global styles
  components/         Triage UI (list, detail, filters, bulk actions)
  data/alerts.json    ~200 generated mock alerts
  lib/                Reducer, filter/sort utilities
  types/alert.ts      Shared TypeScript types

backend/
  schema.sql          SQL Server tables + indexes
  AlertTriage.Api/    ASP.NET minimal API (reference implementation)
```

## State management

All alert state is client-side:

- `useReducer` — alert list mutations, row selection, bulk selection
- `useState` — filter and sort UI state

No Redux, server actions, or API calls from the frontend. Changes do not persist across page refresh.

## Backend (reference)

Minimal ASP.NET 8 API demonstrating how status updates would work against SQL Server. Not wired to the frontend.

### Schema

See [`backend/schema.sql`](backend/schema.sql):

- `Alerts` — alert records with `ROWVERSION` for optimistic concurrency
- `AlertStatusHistory` — audit trail for every status change

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/api/alerts/{id}/status` | Update one alert's status |
| `PATCH` | `/api/alerts/bulk-status` | Update up to 100 alerts |

**Single update body:**

```json
{
  "status": "Resolved",
  "expectedRowVersion": "base64-encoded-rowversion"
}
```

**Bulk update body:**

```json
{
  "ids": ["guid1", "guid2"],
  "status": "False Positive"
}
```

Pass analyst identity via `X-Analyst-Id` header for audit logging.

### Run the API

Requires **.NET 8 SDK** and SQL Server.

```bash
# Apply schema to your database first (schema.sql)
cd backend/AlertTriage.Api
dotnet build
dotnet run
```

Configure connection string in `appsettings.json`.

## Production readiness

| Concern | Approach |
|---------|----------|
| **Concurrency** | `ROWVERSION` optimistic locking; return 409 on stale writes |
| **Audit trail** | `AlertStatusHistory` table; never overwrite silently |
| **AuthZ** | JWT + role claims (`Analyst`, `Lead`); only assignees or leads can resolve |
| **Validation** | Enum whitelist, max batch size (100), id existence checks |
| **Observability** | Structured logging, correlation IDs, metrics on triage latency |
| **Resilience** | Idempotency key header on PATCH; retry-safe |
| **Scale** | Indexed `(Status, Severity, CreatedAt)`; paginated list API |
| **Frontend wire-up** | Optimistic UI update + rollback on 409; debounced server-side search |

## Assumptions

- Frontend uses in-memory state only; no persistence layer
- Mock data is static JSON imported at build time
- Backend is illustrative; frontend does not call it
