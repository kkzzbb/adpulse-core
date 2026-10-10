# Security and Authorization

AdPulse Core treats authentication and authorization as separate concerns.

```text
Authentication
→ Who is making this request?

Authorization
→ May this user access this resource?
```

---

## Authentication

Users authenticate using:

```text
email
password
```

Passwords are never stored directly.

They are hashed using Argon2.

---

## Server-Side Sessions

Authentication uses server-side sessions.

The session stores only:

```text
userId
```

The browser receives a session cookie.

Relevant cookie settings include:

```text
HttpOnly
SameSite=Lax
Secure in production
```

The application does not store authentication tokens in `localStorage`.

---

## Why HttpOnly?

An HttpOnly cookie is not directly readable through normal browser JavaScript.

This reduces exposure of authentication credentials to JavaScript-based attacks.

It does not remove the need for broader application security, but it provides a safer default than manually storing long-lived authentication tokens in browser storage.

---

## `requireAuth`

Protected backend routes use authentication middleware.

Conceptually:

```text
request
  ↓
session.userId exists?
  ├── no → 401
  └── yes
        ↓
request.auth.userId
        ↓
next()
```

The campaign subtree is protected before campaign-specific handlers run.

---

# Authorization

Campaign resources belong to one user.

Repository access therefore uses methods such as:

```text
findAllByUserId(userId)

findByIdForUser(
  userId,
  campaignId
)

updateStatusForUser(
  userId,
  campaignId,
  status
)
```

The established argument convention is:

```text
userId first
resourceId second
new value/input third
```

This makes ownership explicit at each call site.

---

# 401 vs 404

The application intentionally distinguishes:

```text
anonymous request
→ 401 Unauthorized

authenticated owner
→ normal resource response

authenticated non-owner
→ 404 Not Found
```

Why not return `403 Forbidden` for another user's campaign?

Because:

```text
403
```

would reveal that the resource exists.

Returning the same `404` used for nonexistent resources prevents an authenticated attacker from discovering valid IDs belonging to other users.

---

# Authorization Before Business Rules

The order of checks matters.

Correct:

```text
authenticate
→ authorize ownership
→ evaluate campaign status
→ execute action
```

Incorrect:

```text
load campaign state
→ report business-rule error
→ later check ownership
```

For example, Alice should not be able to determine whether Bob's campaign is:

```text
DRAFT
ACTIVE
PAUSED
COMPLETED
```

by observing different error responses.

Therefore ownership is verified first.

---

# Nested Resources

Creatives are accessed through campaigns.

Before the application accesses:

```text
campaign creatives
```

it first verifies that the authenticated user owns the parent campaign.

Conceptually:

```text
Alice requests campaign X creatives
        ↓
find campaign X for Alice
        ↓
not found?
        ↓
404
```

Only after successful parent authorization does the application query child resources.

---

# Server-Controlled Ownership

The client cannot choose:

```text
userId
campaign ownership
spent
server-generated IDs
```

For example, campaign creation derives the owner from:

```text
request.session.userId
```

rather than accepting:

```json
{
  "userId": "..."
}
```

from the request body.

This prevents ownership injection.

---

# Password Handling

Passwords are:

```text
received
→ validated
→ hashed using Argon2
→ stored as password hashes
```

Login verifies the submitted password against the stored hash.

Password hashes are not exposed through API responses.

---

# Generic Authentication Failure

Login behavior should avoid revealing unnecessary information about whether:

```text
an email exists
or
a password is incorrect
```

Generic invalid-credential behavior reduces account-enumeration information.

---

# Soft Archive and Security

Archived campaigns are excluded from normal owner-scoped queries.

This means archived resources are not accidentally exposed through ordinary campaign retrieval endpoints.

---

# Frontend Authentication

The frontend uses:

```text
GET /api/auth/me
```

as the source of truth for the current authenticated identity.

A `401` response maps to:

```text
anonymous user
```

Protected routes use an authentication guard before rendering private pages.

---

# Logout and Cache Isolation

Authentication security is not only about cookies.

Frontend caches may contain private server data.

Consider:

```text
Alice logs in
→ Alice's campaigns cached

Alice logs out

Bob logs in
```

If the campaign cache survives logout, Bob could briefly see Alice's cached data.

Logout therefore:

```text
cancel campaign queries
→ remove campaign query cache
→ set auth state to anonymous
→ navigate to login
```

The campaign query-key hierarchy allows the whole user-sensitive campaign subtree to be removed.

---

# Defense in Depth

Some rules exist in more than one layer.

For example:

```text
Frontend
→ disables invalid activation

Backend
→ rejects invalid activation
```

Similarly:

```text
Application
→ validates age constraints

Database
→ stores durable constraints
```

The client improves experience.

The backend remains authoritative.

The database protects persistent integrity.

---

# Security Principles

```text
Passwords are hashed.

Authentication uses server-side sessions.

Session cookies are HttpOnly.

Ownership comes from authenticated server state.

Repository queries are owner-scoped.

Unauthorized resources return 404.

Authorization occurs before private business-state evaluation.

Child-resource access is gated by parent ownership.

SQL is parameterized.

Frontend private caches are cleared across identity changes.

Backend rules never rely on frontend enforcement.
```