# Frontend Architecture

AdPulse Core uses React and TypeScript with TanStack Query for server state.

The frontend separates:

```text
server-owned state
```

from:

```text
local UI state
```

This distinction is important to keep state predictable.

---

# Server State

Examples of server state include:

```text
authenticated user
campaign list
campaign details
creatives
targeting
```

These values:

- originate from the backend
- may become stale
- may need refetching
- may be shared across components

TanStack Query manages this state.

---

# Local State

Examples of local state include:

```text
form input
temporary edit values
checkbox selection
unsaved targeting changes
```

These values belong to the current UI interaction.

React `useState` is appropriate for them.

---

# Query Client

The application configures a shared TanStack Query client.

Queries use a nonzero stale time to avoid unnecessary refetching while still allowing explicit invalidation when mutations change server state.

Tests use isolated QueryClient instances so state does not leak between test cases.

---

# Query Keys

Campaign query keys are hierarchical.

Conceptually:

```text
["campaigns"]

["campaigns", "list"]

["campaigns", "detail", campaignId]

["campaigns", "detail", campaignId, "creatives"]

["campaigns", "detail", campaignId, "targeting"]
```

This structure allows operations such as:

```text
invalidate one campaign
```

or:

```text
remove every campaign-related query
```

without manually tracking every cache entry.

---

# Mutations

Mutations are used for operations such as:

```text
create campaign
change status
update budget
add creative
save targeting
logout
```

After mutation success, the application either:

```text
updates cached data directly
```

or:

```text
invalidates related queries
```

depending on which approach is clearer for the operation.

---

# Direct Cache Updates

When a mutation response already contains the authoritative new value, the frontend can update cached server state directly.

For example, saved targeting can replace the current targeting query result without requiring an immediate extra HTTP request.

---

# Campaign Readiness

The campaign detail page derives activation readiness from loaded server state.

For example:

```text
hasCreative =
  creatives.length > 0
```

This controls immediate UI feedback.

If no creative exists:

```text
Move to Active
```

is disabled and readiness messaging explains what is missing.

The backend still performs the authoritative activation check.

---

# Targeting Form

Targeting combines:

```text
TanStack Query
→ current server targeting

React state
→ unsaved form draft
```

When the campaign is DRAFT:

```text
form editable
save available
```

When the campaign is ACTIVE:

```text
form read-only
save unavailable
locked message shown
```

This reflects the backend business rule in the UI.

---

# Authentication State

The frontend uses:

```text
GET /api/auth/me
```

as the source of truth.

A successful response produces an authenticated user.

A `401` response is interpreted as:

```text
no authenticated user
```

Authentication is not inferred from browser storage.

---

# Protected Routes

Protected pages are wrapped by an authentication route guard.

Conceptually:

```text
auth loading
→ wait

auth user exists
→ render protected content

auth user missing
→ redirect to login
```

---

# Login and Registration

After successful login or registration:

```text
backend establishes session
→ frontend updates authenticated-user query
→ navigation enters protected application
```

The browser automatically sends the session cookie with subsequent requests according to the application's request configuration.

---

# Logout

Logout is treated as an identity-boundary operation.

The flow is:

```text
POST /api/auth/logout
        ↓
cancel user-sensitive queries
        ↓
remove campaign cache
        ↓
auth cache becomes anonymous
        ↓
navigate to login
```

This is important because cached server data may contain information belonging to the previous user.

---

# Cache Isolation Example

Without cache clearing:

```text
Alice
→ loads Alice Campaign

Alice logs out

Bob logs in

old cache
→ Alice Campaign briefly visible
```

With the implemented flow:

```text
Alice logs out
→ campaign cache removed

Bob logs in
→ no Alice campaign data exists locally
→ Bob's query loads independently
```

This behavior is covered by frontend tests.

---

# Error Handling

Frontend mutation and query states distinguish:

```text
loading
success
failure
```

The UI reflects business errors returned by the backend rather than assuming client-side validation is sufficient.

---

# Frontend Design Principles

```text
TanStack Query owns server state.

React state owns unsaved form state.

Query keys are hierarchical.

Backend responses are treated as authoritative.

Mutations update or invalidate relevant cache entries.

Protected routes rely on /auth/me.

Logout clears identity-specific cached data.

Frontend validation improves UX but does not replace backend validation.
```
