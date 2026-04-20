# API Reference

Complete inventory of HTTP endpoints. All routes are App Router route handlers under `app/api/` (Next.js 16). All bodies are JSON unless noted.

Authentication uses an HTTP-only JWT cookie set by `setSessionCookie` in `lib/features/auth/session.ts`. Authorization is enforced in two layers:

1. **`proxy.ts` (Next.js 16's renamed middleware)** — blocks unauthenticated/non-admin requests at the edge for matched paths.
2. **Inside route handlers** — re-checks `getSession()` for paths that proxy doesn't gate (everything outside the `matcher`).

Common error envelopes:
```json
{ "error": "INVALID_INPUT", "issues": [/* zod issues */] }
{ "error": "UNAUTHORIZED" }     // 401
{ "error": "FORBIDDEN" }        // 403
{ "error": "NOT_FOUND" }        // 404
{ "error": "INTERNAL" }         // 500
```

---

## Auth — `app/api/auth/`

### `POST /api/auth/login`
Public. Verify credentials and set the session cookie.

- Body: `{ phone?, email?, password }` (must provide at least one of phone/email; validated by `loginSchema`)
- 200 → `{ ok: true, role: "user" | "admin" }` and sets `Set-Cookie`
- 401 → `INVALID_CREDENTIALS`
- 400 → `INVALID_INPUT`

### `POST /api/auth/register`
Public. One-shot create-user-and-application. Sets session cookie on success.

- Body: `{ credentials: { phone?, email?, password, confirmPassword }, application: ApplicationFormInput }`
- 200 → `{ ok: true }` (user created, application in PENDING)
- 409 → `PHONE_TAKEN` / `EMAIL_TAKEN` / `NICKNAME_TAKEN`
- 400 → `INVALID_INPUT`

### `POST /api/auth/logout`
Authenticated. Clears the session cookie.

- 200 → `{ ok: true }`

### `GET /api/auth/me`
Authenticated. Returns the current user's contact info (email/phone + role).

- 200 → `{ user: { id, email?, phone?, role } }`
- 401 → `UNAUTHORIZED`

### `POST /api/auth/change-password`
Authenticated. Verifies a one-time code and updates the password hash.

- Body: `{ code, newPassword }`
- Dev mock: code `000000` is always accepted. Replace with real SMS/email channel.
- 400 → `INVALID_CODE` if code wrong
- 200 → `{ ok: true }`

---

## Applications — `app/api/applications/`

End-user-facing routes for the user's own application. All require an authenticated session.

### `GET /api/applications/me`
Returns the current user's application (or `null`).

- 200 → `{ application: Application | null }`

### `POST /api/applications/me/mark-paid`
User signals "I've paid" — flips `paymentStatus` from `UNPAID` to `PAID`. (In production, replace with a real payment-gateway webhook.)

- 200 → `{ application }`
- 409 if no application or already paid

---

## Journey — `app/api/journey/`

### `GET /api/journey/me`, `PUT /api/journey/me`
Authenticated. Get / upsert the current user's journey. Auto-creates a default profile on first GET.

- GET 200 → `{ journey: Journey }`
- PUT body: full `Journey` payload (validated by `journeySchema`)
- PUT 200 → `{ journey }`

### `GET /api/journey/share/[id]`
Public. Returns a journey filtered by the owner's `fieldVisibility`. Hidden fields are stripped server-side — never exposed to the client.

- 200 → `{ journey: PartialJourney }`
- 404 if not found

---

## Bases (public read) — `app/api/bases/`

### `GET /api/bases?query=&tag=&skill=&province=`
Public. Filtered base list. All filters optional and combined with AND.

- 200 → `{ bases: Base[] }`

### `GET /api/bases/[id]`
Public. Single base + joined `producedWorks` (gathered from all journeys).

- 200 → `{ base, producedWorks: Work[] }`
- 404 → `NOT_FOUND`

---

## Co-learning (public read) — `app/api/co-learning/`

### `GET /api/co-learning?query=&skill=&level=`
Public. Filtered event list, sorted by start date desc.

- 200 → `{ events: CoLearningEvent[] }`

---

## Admin — `app/api/admin/`

All admin routes are gated by `proxy.ts` — unauthenticated or non-admin requests get **403 FORBIDDEN** before the handler runs.

### Applications

`GET /api/admin/applications` — list all applications, newest first.
- 200 → `{ applications: Application[] }`

`POST /api/admin/applications/[id]/approve` — approve. Sets `reviewStatus=APPROVED`, `didStatus=PENDING_ASSIGN`, records reviewer & timestamp.
- 200 → `{ application }`

`POST /api/admin/applications/[id]/reject` — reject. Body: `{ reason }` (validated). If application was paid, sets `paymentStatus=REFUND_PENDING` and `reviewStatus=REJECTED_AWAITING_REFUND`.
- 200 → `{ application }`

### Refunds

`POST /api/admin/refunds/[id]/complete` — mark refund settled. Sets `reviewStatus=REJECTED_REFUNDED`, `paymentStatus=REFUNDED`.
- 200 → `{ application }`

### DIDs

`POST /api/admin/dids/[id]/assign` — assign or update a DID for an approved user. Body: `{ didInfo }`. Sets `didStatus=ASSIGNED`.
- 200 → `{ application }`

### Bases (CRUD)

- `GET    /api/admin/bases`        — list all
- `POST   /api/admin/bases`        — create. Body validated by `baseUpsertSchema`.
- `GET    /api/admin/bases/[id]`   — read one (includes everything)
- `PUT    /api/admin/bases/[id]`   — full update (validated)
- `DELETE /api/admin/bases/[id]`   — delete

### Co-learning events (CRUD)

- `GET    /api/admin/co-learning`        — list all
- `POST   /api/admin/co-learning`        — create. Body validated by `coLearningUpsertSchema`.
- `PUT    /api/admin/co-learning/[id]`   — full update
- `DELETE /api/admin/co-learning/[id]`   — delete

---

## Dev-only — `app/api/dev/`

Both endpoints return **403 DISABLED** when `NODE_ENV === "production"`.

### `GET /api/dev/seed?reset=1`
- Without `reset=1`: returns `{ seeded: boolean, accounts }`
- With `reset=1`: wipes and reseeds users, applications, bases, events, journeys

### `GET /api/dev/login-as`
Lists demo accounts. Auto-seeds if the DB is empty.

- 200 → `{ seededJustNow, accounts: [{ key, label, role }] }`

### `POST /api/dev/login-as`
Sets the session cookie for a demo account.

- Body: `{ key: "admin" | "alice" | "bob" }`
- 200 → `{ ok: true, role, key }`
- 400 → `INVALID_KEY`

---

## Domain types reference

All defined in `lib/features/_shared/fake-db.ts`. Key shapes:

| Type | File | Purpose |
|---|---|---|
| `User` | fake-db.ts | id, phone?, email?, passwordHash, role, createdAt |
| `Application` | fake-db.ts | userId, nickname, selfIntro, interestTags, portfolio?, paymentStatus, reviewStatus, didStatus?, didInfo?, ... |
| `Journey` | fake-db.ts | 1:1 with userId. avatarUrl, displayName, bio, stays[], learning/teaching records, works[], wishToLearn[], fieldVisibility |
| `Base` | fake-db.ts | name, province, city, description, tags, localLife, applyUrl, skillsOffered/Needed, localProjects[], timeline[], lat/lng |
| `CoLearningEvent` | fake-db.ts | name, instructorName, baseId, skillTags[], level, period |

Validators (zod) live alongside each feature in `lib/features/<feature>/schema.ts`. Shared validators (phone, email, password, dateRange, emoji, sanitize) in `lib/features/_shared/validators.ts`.

---

## Adding a new endpoint

1. Decide if it needs admin gating — if so, place under `app/api/admin/` and the proxy will gate it automatically.
2. Define / extend a zod schema in the feature's `schema.ts`.
3. Add data access in the feature's `repo.ts`. Never import `fake-db.ts` from a route handler directly — go through the repo.
4. Validate input with `schema.safeParse(body)` — return `400 INVALID_INPUT` with the issues on failure.
5. Add a row to this file.
6. If a frontend page consumes it, link it in `docs/ui.md`.

---

## Swapping the fake DB for a real one

The fake DB lives entirely in `lib/features/_shared/fake-db.ts`. Replace `getTable` / `saveTable` / `updateTable` with calls to your real database. As long as the function signatures stay the same, no feature `repo.ts` and no route handler needs to change.
