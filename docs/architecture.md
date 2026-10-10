# Architecture

AdPulse Core uses a layered full-stack architecture designed to keep HTTP concerns, business rules, persistence, authentication, and UI state separate.

## System Overview

```text
Browser
  ↓
React + TypeScript
  ↓
HTTP / JSON
  ↓
Express
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

The frontend communicates with the backend through REST-style HTTP endpoints.

The backend is divided into layers with clear responsibilities.

---

## Backend Request Flow

A typical request follows:

```text
Route
  ↓
Zod validation
  ↓
Controller
  ↓
Service
  ↓
Repository interface
  ↓
PostgreSQL implementation
```

For example, changing campaign status follows approximately:

```text
PATCH /api/campaigns/:id/status
        ↓
validate request body
        ↓
CampaignController
        ↓
CampaignService
        ↓
CampaignRepository
        ↓
PostgreSQL
```

Each layer intentionally has a limited role.

---

## Routes

Routes define:

- HTTP method
- URL
- middleware
- validation
- controller invocation

Example:

```text
PATCH /api/campaigns/:id/status
```

Routes do not contain campaign lifecycle rules or SQL.

---

## Runtime Validation

External data is validated using Zod.

TypeScript provides compile-time safety, but incoming HTTP data exists at runtime and therefore requires runtime validation.

Validation is used for:

- campaign creation
- campaign updates
- status transitions
- budget updates
- creative creation
- targeting updates
- authentication requests

The backend also distinguishes between client-controlled and server-controlled values.

Examples of client-controlled values:

```text
name
budget
headline
destinationUrl
countries
devices
ageMin
ageMax
```

Examples of server-controlled values:

```text
userId
resource IDs
spent
campaign ownership
session identity
```

---

## Controllers

Controllers translate between HTTP and application behavior.

A controller typically:

```text
read authenticated user
read route parameters
read validated input
call service
translate result to HTTP response
forward errors
```

Controllers do not contain SQL.

Controllers also do not own business rules such as whether a DRAFT campaign may become ACTIVE.

---

## Services

Services contain application business rules.

Examples:

- campaign lifecycle transitions
- activation readiness
- campaign budget restrictions
- creative creation restrictions
- targeting edit restrictions
- authorization checks

This keeps business behavior independent from Express and PostgreSQL.

---

## Repositories

Services depend on repository interfaces.

Example:

```text
CampaignService
      ↓
CampaignRepository
      ↑
PostgresCampaignRepository
```

This separates business rules from persistence.

It also allows unit tests to replace real database repositories with controlled mocks.

---

## Dependency Injection

Dependencies are assembled in the backend composition root.

Conceptually:

```text
PostgreSQL Pool
      ↓
Repositories
      ↓
Services
      ↓
Controllers
      ↓
Routers
      ↓
Express
```

Example:

```text
PostgresCampaignRepository
PostgresCreativeRepository
PostgresTransactionManager
          ↓
    CampaignService
          ↓
  CampaignController
          ↓
    CampaignRouter
```

Services receive dependencies through constructors instead of constructing infrastructure internally.

---

# Campaign Domain

A campaign contains:

```text
id
userId
name
budget
spent
status
```

Supported states are:

```text
DRAFT
ACTIVE
PAUSED
COMPLETED
```

## Lifecycle

```text
DRAFT → ACTIVE

ACTIVE → PAUSED
ACTIVE → COMPLETED

PAUSED → ACTIVE
PAUSED → COMPLETED

COMPLETED → terminal
```

Requesting the current state again is treated as an idempotent no-op.

Invalid transitions return a conflict response.

---

## Activation Readiness

A campaign cannot become ACTIVE unless at least one creative exists.

The backend service owns the authoritative rule.

The frontend also derives readiness to improve user feedback.

```text
Frontend
→ prevents obviously invalid action

Backend
→ enforces actual rule
```

The backend never trusts the browser to enforce business rules.

---

# Creatives

Creatives belong to campaigns.

A creative contains:

```text
id
campaignId
headline
body
destinationUrl
```

Routes are nested:

```text
GET  /api/campaigns/:campaignId/creatives
POST /api/campaigns/:campaignId/creatives
```

New creatives may only be created while the campaign is in DRAFT state.

Before accessing creatives, the service verifies ownership of the parent campaign.

This gives the access sequence:

```text
authenticate
→ authorize parent campaign
→ evaluate business state
→ access child resource
```

---

# Targeting

A campaign may have one targeting configuration.

Targeting contains:

```text
countries
devices
ageMin
ageMax
```

Supported devices are:

```text
DESKTOP
MOBILE
TABLET
```

Country codes are normalized to uppercase two-letter values.

Duplicate countries are removed.

No targeting row means unrestricted targeting:

```text
countries = []
devices = []
ageMin = null
ageMax = null
```

Targeting may only be modified while the campaign is DRAFT.

Targeting is optional for activation because missing targeting intentionally means broad targeting.

---

# Soft Archival

Campaign deletion is implemented as soft archival.

Instead of deleting the row:

```text
DELETE
```

updates:

```text
archived_at
```

Normal campaign queries exclude archived rows.

ACTIVE campaigns cannot be archived.

This preserves historical data while hiding archived campaigns from normal application use.

---

# Transactions

Compound writes use PostgreSQL transactions.

Example:

```text
create campaign
+
create initial creative
```

must either both succeed or both fail.

Conceptually:

```text
BEGIN

create campaign
create creative

COMMIT
```

On failure:

```text
ROLLBACK
```

Repositories participating in the transaction share the same `PoolClient`.

A transaction manager abstraction prevents the service layer from depending directly on PostgreSQL transaction mechanics.

---

# Application Composition

The backend keeps startup and application construction separate.

Conceptually:

```text
app.ts
→ creates repositories
→ creates services
→ creates controllers
→ mounts routes

server.ts
→ starts the HTTP server
```

This keeps object construction centralized and application behavior testable.

---

# Design Principles

The project intentionally follows these rules:

```text
Controllers do not contain SQL.

Repositories do not contain HTTP behavior.

Services own business rules.

External input is validated at runtime.

Ownership fields are server-controlled.

Authorization happens before private state checks.

Repositories use parameterized SQL.

Compound writes share one transaction connection.

Backend rules remain authoritative.

Dependencies are injected rather than constructed inside services.
```