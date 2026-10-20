# AdPulse Core

AdPulse Core is a full-stack advertising campaign management platform built with React, TypeScript, Express, and PostgreSQL.

The project focuses on production-style application design rather than simple CRUD. It includes authentication, authorization, campaign lifecycle rules, creatives, targeting, transactions, database migrations, frontend server-state management, containerization, and layered automated testing.

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

Additional tooling:

- Docker
- Docker Compose
- Nginx
- PostgreSQL migrations

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
- Multi-container Docker setup
- Automated migration startup flow

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

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Environment files are excluded from Git.

## Run with Docker

AdPulse Core can be run as a complete containerized stack with Docker Compose.

The Docker setup includes:

```text
Browser
   ↓
localhost:8080
   ↓
Nginx + React
   ↓
Express API
   ↓
PostgreSQL
```

The services are:

- `frontend` — builds the React application and serves it with Nginx
- `backend` — runs the compiled Express API
- `db` — PostgreSQL
- `migrate` — runs database migrations before the backend starts

### Requirements

- Docker
- Docker Compose

### 1. Create the Docker environment file

Copy the example:

```bash
cp .env.docker.example .env.docker
```

Then configure:

```env
POSTGRES_PASSWORD=replace-with-a-local-password
SESSION_SECRET=replace-with-a-long-random-secret
```

`.env.docker` is excluded from Git.

### 2. Build and start the application

From the repository root:

```bash
docker compose --env-file .env.docker up --build -d
```

Docker Compose starts the services in dependency order:

```text
PostgreSQL healthy
        ↓
migrations complete
        ↓
backend starts
        ↓
backend healthy
        ↓
frontend starts
```

### 3. Check container status

```bash
docker compose --env-file .env.docker ps -a
```

A successful startup should show approximately:

```text
db         healthy
migrate    exited (0)
backend    healthy
frontend   running
```

The migration container is expected to exit with code `0` because it is a one-time setup job rather than a long-running service.

### 4. Open the application

Visit:

```text
http://localhost:8080
```

The frontend container serves the React application through Nginx.

Requests to:

```text
/api/*
```

are proxied internally to the backend container.

The backend and PostgreSQL ports do not need to be exposed publicly because Docker Compose provides an internal network between services.

### 5. Verify the backend health endpoint

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{
  "status": "ok"
}
```

### 6. View logs

All services:

```bash
docker compose --env-file .env.docker logs
```

Backend only:

```bash
docker compose --env-file .env.docker logs backend
```

Migration job:

```bash
docker compose --env-file .env.docker logs migrate
```

PostgreSQL:

```bash
docker compose --env-file .env.docker logs db
```

### 7. Stop the application

```bash
docker compose --env-file .env.docker down
```

PostgreSQL data is preserved in a named Docker volume.

### Reset the Docker database

To stop the stack and also remove the PostgreSQL volume:

```bash
docker compose --env-file .env.docker down -v
```

The next startup creates a fresh database and reapplies all migrations.

> `down -v` permanently deletes the PostgreSQL data stored by this Docker Compose project.

## Docker Architecture Notes

A few important design decisions:

- the frontend is served by Nginx rather than the Vite dev server
- Nginx proxies `/api/*` requests to the backend container
- the backend connects to PostgreSQL using the Compose service name `db`
- PostgreSQL data is stored in a named Docker volume
- Docker healthchecks ensure services are actually ready before dependents start
- migrations run as a one-shot service before the API starts
- backend and database ports remain internal to the Compose network

One important lesson from containerizing the project was that a healthy PostgreSQL container does not necessarily mean the application is ready.

PostgreSQL may be accepting connections while the application schema has not yet been created.

The startup flow therefore explicitly models:

```text
database readiness
→ schema migration readiness
→ API readiness
```

rather than treating them as the same thing.

## Quality Checks

### Backend

```bash
cd backend
npm run typecheck
npm test
```

### Frontend

```bash
cd frontend
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
- PostgreSQL transactions
- migration safety
- authentication and authorization
- secure ownership boundaries
- frontend server-state management
- cache invalidation
- layered testing
- Docker multi-stage builds
- Docker Compose service orchestration
- Nginx reverse proxying
- container networking
- persistent Docker volumes
- service healthchecks
- migration-aware startup ordering

A separate project extends this foundation with Kafka, asynchronous analytics processing, distributed-system reliability patterns, Kubernetes, CI/CD, and observability.