# Testing Strategy

AdPulse Core uses layered automated testing.

The goal is not to test the same behavior identically at every level.

Each test layer answers a different question.

```text
Service tests
      ↓
API integration tests
      ↓
React component tests
      ↓
Playwright E2E
```

Lower-level tests are faster and more precise.

Higher-level tests prove that more pieces work together.

---

# Service Tests

Backend service tests use Vitest.

Repositories and other dependencies are replaced with mocks.

These tests focus on business behavior.

Examples include:

```text
valid campaign transitions
invalid lifecycle transitions
activation requires a creative
creative creation allowed only in DRAFT
targeting editable only in DRAFT
authorization happens before child access
authentication behavior
```

Typical structure:

```text
Arrange
→ configure fixture and mocks

Act
→ call service

Assert
→ verify result or error
→ verify dependency interactions
```

---

# Why Mock Repositories?

The service layer should be testable without:

```text
Express
HTTP
PostgreSQL
```

Mocks let tests control exactly what each dependency returns.

For example:

```text
campaignRepository.findByIdForUser
→ return ACTIVE campaign
```

allows the test to focus purely on a service rule.

---

# Interaction Assertions

Tests do not only inspect returned values.

They also verify that forbidden work does not happen.

Example:

```text
foreign campaign
→ Campaign not found
→ creative repository must NOT be queried
```

This protects authorization ordering.

---

# API Integration Tests

Supertest exercises the real Express application.

Integration tests use:

```text
real routes
real middleware
real sessions
real services
real repositories
real PostgreSQL
```

They therefore test interactions that service mocks cannot.

---

# Dedicated Test Database

Integration tests use:

```text
adpulse_test
```

rather than the normal development database.

The test environment is loaded separately from normal development configuration.

---

# Database Reset Guard

Before destructive test cleanup, the reset utility runs:

```sql
SELECT current_database();
```

It refuses to continue unless the result is exactly:

```text
adpulse_test
```

Conceptually:

```text
if database !== adpulse_test
→ throw
→ never TRUNCATE
```

This guard exists because automated integration tests perform destructive reset operations.

---

# Integration Coverage

Important API integration scenarios include:

```text
anonymous campaign access → 401

register user
→ session established
→ /auth/me returns user

Alice creates campaign
Bob cannot see it

Alice cannot modify Bob's campaign

activation fails without creative

add creative
→ activation succeeds

targeting absent
→ unrestricted default returned

save targeting
→ normalized values returned

activate campaign
→ targeting locked

invalid targeting
→ 400

logout
→ session invalidated
```

These tests verify both behavior and security boundaries.

---

# Frontend Component Tests

Frontend tests use:

```text
Vitest
React Testing Library
user-event
jest-dom
```

The tests focus on user-visible behavior rather than internal implementation details.

---

# CampaignReadiness Tests

Coverage includes:

```text
no creative
→ Required message

creative exists
→ Ready

creative query loading
→ Checking state
```

One useful testing lesson was avoiding overly broad text selectors when multiple elements contained:

```text
Ready
```

Tests were improved to target the correct semantic region.

---

# CampaignStatusControls Tests

Tests verify:

```text
activation unavailable without readiness

activation enabled when readiness passes

button click calls status mutation
```

A regression test specifically protects the actual `disabled` behavior of the activation button.

---

# CampaignTargetingPanel Tests

Tests verify:

```text
ACTIVE campaign
→ fields disabled
→ save unavailable
→ locked message

DRAFT campaign
→ editable
→ countries normalized
→ devices submitted
→ ages submitted
```

---

# Authentication Component Tests

Protected-route tests cover:

```text
unauthenticated
→ redirect to login

authenticated
→ protected content rendered
```

Logout tests verify both navigation and cache behavior.

---

# Cache Isolation Tests

A dedicated test verifies that campaign query data is removed during identity changes.

Example:

```text
Alice campaign data cached
        ↓
clearUserScopedQueries()
        ↓
campaign cache undefined
        ↓
Bob cannot inherit Alice's cache
```

This is a privacy behavior, not merely a performance concern.

---

# End-to-End Testing

Playwright covers one critical browser journey.

The test drives the real frontend and backend.

Workflow:

```text
register
→ create campaign
→ activation initially blocked
→ add creative
→ configure targeting
→ activate
→ reload page
→ verify persisted state
```

Reloading is important because it demonstrates that state is persisted in PostgreSQL rather than existing only in React memory.

---

# Why Keep E2E Small?

End-to-end tests are valuable but comparatively:

```text
slow
infrastructure-dependent
harder to diagnose
more brittle
```

Therefore detailed edge cases remain in lower layers.

E2E is reserved for critical workflows.

---

# Test Separation

Backend testing is separated into:

```text
unit/service tests
```

and:

```text
API integration tests
```

This avoids accidentally running database-dependent tests as part of an isolated service test run.

Frontend testing similarly separates:

```text
Vitest
→ src component/unit tests

Playwright
→ e2e tests
```

The Vitest configuration only discovers frontend test files under `src`, preventing Playwright tests from being executed by the wrong test runner.

---

# Quality Gates

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

These are run before final project checkpoints.

---

# Testing Philosophy

The testing strategy follows several principles:

```text
Test business rules close to the service layer.

Use integration tests for infrastructure boundaries.

Test frontend behavior from the user's perspective.

Keep E2E focused on critical journeys.

Assert that unauthorized work does not happen.

Use dedicated test infrastructure.

Protect development data from destructive tests.

Make regression tests for real bugs encountered during development.
```

---

# Testing Pyramid

```text
                 ┌──────────────┐
                 │  Playwright  │
                 │     E2E      │
                 └──────┬───────┘
                        │
              ┌─────────▼─────────┐
              │ React component   │
              │       tests       │
              └─────────┬─────────┘
                        │
             ┌──────────▼──────────┐
             │ API integration     │
             │ Express + Postgres  │
             └──────────┬──────────┘
                        │
              ┌─────────▼─────────┐
              │ Service tests     │
              │ mocked deps       │
              └───────────────────┘
```

The lower layers contain most detailed behavior because they provide the fastest and clearest feedback.