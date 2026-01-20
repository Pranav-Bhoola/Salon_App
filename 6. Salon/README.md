# SalonOS Phase 1 Foundation

## Prereqs
- Node.js 20
- Docker

## Setup
1) Copy env
```
cp .env.example .env
```
2) Start Postgres
```
docker compose up -d
```
3) Install deps
```
pnpm install
```
4) Run migrations
```
pnpm prisma:migrate
```
5) Start API
```
pnpm dev
```

## Tests
```
pnpm test
```

## Notes
- Tenant context is provided via `x-tenant-id` header.
- Slot holds expire after 2 minutes (enforced in code).
## Web UI
- Visit `http://localhost:3001` for the dashboard.
- Set tenant/user context at `/tenant` before using the dashboard.
