# AdPulse Core

AdPulse Core is a full-stack advertising campaign management platform built with React, TypeScript, Express, and PostgreSQL.

The project focuses on production-style application design rather than simple CRUD. It includes authentication, authorization, campaign lifecycle rules, creatives, targeting, transactions, database migrations, frontend server-state management, and layered automated testing.

https://github.com/user-attachments/assets/4705bf1e-2408-40c4-9fd3-f4e1b2893064

## Tech Stack

| Frontend | Backend |
| :--- | :--- |
| React | Node.js |
| TypeScript | TypeScript |
| Vite | Express |
| TanStack Query | Zod |
| React Router | PostgreSQL |
| Vitest | Argon2 |
| React Testing Library | Express sessions |
| Playwright | Vitest & Supertest |

## Core Features

- Email/password authentication
- Server-side sessions
- Owner-scoped campaign access
- Campaign lifecycle management
- Budget rules
- Creative management
- Campaign targeting
- Soft archival
- PostgreSQL transactions
- Custom migration runner
- Frontend query caching
- Auth-aware cache isolation
- Unit, integration, component, and E2E testing

## Architecture

The backend uses a layered architecture:

```text
HTTP
 ↓
Route
 ↓
Validation
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
PostgreSQL
```

Services contain business rules, repositories handle persistence, controllers translate HTTP requests, and dependencies are assembled in the application composition root.

More detail:

- [Architecture](docs/architecture.md)
- [Database Design](docs/database.md)
- [Security and Authorization](docs/security.md)
- [Frontend Architecture](docs/frontend.md)
- [Testing Strategy](docs/testing.md)

## Campaign Lifecycle

```text
DRAFT → ACTIVE
ACTIVE → PAUSED
ACTIVE → COMPLETED
PAUSED → ACTIVE
PAUSED → COMPLETED
COMPLETED → terminal
```

Campaign activation requires at least one creative.

Targeting is optional and can only be edited while the campaign is in DRAFT state.

## Authorization

Authenticated users may only access their own campaigns.

The API intentionally distinguishes:

```text
Anonymous user
→ 401 Unauthorized

Authenticated owner
→ resource returned

Authenticated non-owner
→ 404 Not Found
```

Returning `404` for unauthorized resources prevents leaking whether another user's resource exists.

See [Security and Authorization](docs/security.md).

## Testing

AdPulse uses several testing layers:

```text
Service tests
      ↓
API integration tests
      ↓
React component tests
      ↓
Playwright E2E
```

The E2E suite remains intentionally small while detailed behavior is covered by faster lower-level tests.

See [Testing Strategy](docs/testing.md).

## Local Development

Requirements:

- Node.js
- npm
- Docker

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Environment files are excluded from Git.

## Quality Checks

Backend:

```bash
npm run typecheck
npm test
```

Frontend:

```bash
npm run build
npm test
npm run test:e2e
```

## What This Project Demonstrates

AdPulse Core demonstrates:

- layered backend architecture
- dependency injection
- runtime validation
- relational database design
- transactions
- migration safety
- authentication and authorization
- secure ownership boundaries
- frontend server-state management
- cache invalidation
- layered testing

A separate project extends this foundation with Kafka, asynchronous analytics processing, containerization, orchestration, and observability.