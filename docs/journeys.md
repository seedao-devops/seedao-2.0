# User Journeys & MVP v0.1 Release Tracker

> Language: **English** · [中文](./journeys.zh-CN.md)

A persona-by-persona walkthrough of every user journey we ship, with the UI components and API endpoints behind each step. Use the checkboxes to track what is left before we cut **MVP v0.1**. This doc is intended for both engineers (who need exact file paths) and non-engineers (who want a narrative they can read top-to-bottom).

For deeper references, see [`docs/ui.md`](./ui.md) (page-by-page component inventory), [`docs/api.md`](./api.md) (HTTP endpoint contracts), and [`docs/testing.md`](./testing.md) (manual test scenarios).

---

## Legend

Each journey step is rated against four columns:

| Column | Meaning |
|---|---|
| **UI** | The page / component is rendered and visually complete. |
| **API** | The route handler exists and returns the documented shape. |
| **Wired** | The UI calls the real API end-to-end (no mock fetches, no `console.log` placeholders). |
| **Test** | The matching scenario in [`docs/testing.md`](./testing.md) passes today. |

In the tables: `[x]` = done · `[ ]` = todo · `—` = not applicable to this step.

A journey is considered **v0.1 ready** only when every row in its table is `[x]` (or `—`) across all four columns.

---

## Persona 1 — Guest (logged out)

Anyone landing on the site without an account. Should be able to discover the community without friction and view shared profiles.

### G1. Discover the community

**As a guest, I want to** browse SeeDAO bases and co-learning events so I can decide whether to apply.

| # | Step                                  | Page / UI component                                                  | API endpoint                  | UI  | API | Wired | Test |
|---|---------------------------------------|----------------------------------------------------------------------|-------------------------------|-----|-----|-------|------|
| 1 | Land on home, see hero + CTAs         | [`app/(public)/page.tsx`](../app/(public)/page.tsx)                  | —                             | [ ] | —   | —     | [ ]  |
| 2 | Open base explorer, search & filter   | `BasesExplorer`, `BasesMap` ([`components/features/bases/`](../components/features/bases/)) | `GET /api/bases`              | [ ] | [ ] | [ ]   | [ ]  |
| 3 | Open a base detail page               | [`app/(public)/bases/[id]/page.tsx`](../app/(public)/bases/[id]/page.tsx) | `GET /api/bases/[id]`         | [ ] | [ ] | [ ]   | [ ]  |
| 4 | Browse co-learning events             | `CoLearningExplorer` ([`components/features/co-learning/`](../components/features/co-learning/)) | `GET /api/co-learning`        | [ ] | [ ] | [ ]   | [ ]  |
| 5 | Click a gated tab → bounced to `/login` with `?redirect=` | [`proxy.ts`](../proxy.ts) + bottom nav        | —                             | [ ] | —   | [ ]   | [ ]  |

### G2. View a shared profile

**As a guest, I want to** open a member's QR-shared journey link and see only the fields they chose to make public.

| # | Step                                  | Page / UI component                                                  | API endpoint                       | UI  | API | Wired | Test |
|---|---------------------------------------|----------------------------------------------------------------------|------------------------------------|-----|-----|-------|------|
| 1 | Open `/share/[id]` from a QR / link   | [`app/(public)/share/[id]/page.tsx`](../app/(public)/share/[id]/page.tsx), `JourneyView` (read-only) | `GET /api/journey/share/[id]`      | [ ] | [ ] | [ ]   | [ ]  |
| 2 | Confirm hidden fields are stripped server-side | `JourneyView` honours `fieldVisibility`                     | server-side filtering in handler   | [ ] | [ ] | [ ]   | [ ]  |

---

## Persona 2 — Member (logged-in user)

Someone with a SeeDAO account. Goes through onboarding, then maintains a profile and shares it.

### M1. Onboard & get approved

**As a prospective member, I want to** register, submit my application, mark my payment, and watch its status until I'm approved with a DID.

| # | Step                                       | Page / UI component                                                             | API endpoint                              | UI  | API | Wired | Test |
|---|--------------------------------------------|---------------------------------------------------------------------------------|-------------------------------------------|-----|-----|-------|------|
| 1 | Step through 4-step register wizard        | `RegisterWizard` ([`components/features/applications/register-wizard.tsx`](../components/features/applications/register-wizard.tsx)) | `POST /api/auth/register`                 | [ ] | [ ] | [ ]   | [ ]  |
| 2 | See application status after submit        | `ApplicationStatus` ([`components/features/applications/application-status.tsx`](../components/features/applications/application-status.tsx)) | `GET /api/applications/me`                | [ ] | [ ] | [ ]   | [ ]  |
| 3 | Click "标记已付款"                         | `ApplicationStatus`                                                             | `POST /api/applications/me/mark-paid`     | [ ] | [ ] | [ ]   | [ ]  |
| 4 | Watch review timeline (待审核 → 通过/拒绝) | `ApplicationStatus`                                                             | `GET /api/applications/me` (poll/refresh) | [ ] | [ ] | [ ]   | [ ]  |
| 5 | See assigned DID once admin assigns it     | `ApplicationStatus`                                                             | `GET /api/applications/me`                | [ ] | [ ] | [ ]   | [ ]  |
| 6 | Refund timeline visible if rejected        | `ApplicationStatus` (refund branch)                                             | `GET /api/applications/me`                | [ ] | [ ] | [ ]   | [ ]  |
| 7 | **Real payment-gateway webhook** replaces self-service "标记已付款" | `ApplicationStatus`                                  | new `POST /api/payments/webhook`          | [ ] | [ ] | [ ]   | [ ]  |

### M2. Maintain my journey

**As an approved member, I want to** view and edit my multi-section profile, control which fields are public, and share it via QR.

| # | Step                                     | Page / UI component                                                           | API endpoint            | UI  | API | Wired | Test |
|---|------------------------------------------|-------------------------------------------------------------------------------|-------------------------|-----|-----|-------|------|
| 1 | View my journey                          | [`app/(user)/journey/page.tsx`](../app/(user)/journey/page.tsx), `JourneyView` (full)| `GET /api/journey/me`   | [ ] | [ ] | [ ]   | [ ]  |
| 2 | Edit profile, stays, learning, teaching, works, wish-to-learn | `ProfileEditor` ([`components/features/journey/profile-editor.tsx`](../components/features/journey/profile-editor.tsx)) | `PUT /api/journey/me`   | [ ] | [ ] | [ ]   | [ ]  |
| 3 | Toggle visibility per profile section    | `SharePanel` ([`components/features/journey/share-panel.tsx`](../components/features/journey/share-panel.tsx)) | `PUT /api/journey/me`   | [ ] | [ ] | [ ]   | [ ]  |
| 4 | Copy share URL + render QR code          | `SharePanel` (`qrcode.react`)                                                 | —                       | [ ] | —   | [ ]   | [ ]  |
| 5 | Verify hidden fields stripped in incognito | (cross-checks G2)                                                           | `GET /api/journey/share/[id]` | [ ] | [ ] | [ ]   | [ ]  |

### M3. Account hygiene

**As any member, I want to** log in, change my password, and log out reliably.

| # | Step                                 | Page / UI component                                                              | API endpoint                  | UI  | API | Wired | Test |
|---|--------------------------------------|----------------------------------------------------------------------------------|-------------------------------|-----|-----|-------|------|
| 1 | Log in via phone or email tab        | [`app/(auth)/login/page.tsx`](../app/(auth)/login/page.tsx)                      | `POST /api/auth/login`        | [ ] | [ ] | [ ]   | [ ]  |
| 2 | Header shows identity + dropdown     | `UserHeaderMenu` ([`components/layout/user-header-menu.tsx`](../components/layout/user-header-menu.tsx)) | `GET /api/auth/me`            | [ ] | [ ] | [ ]   | [ ]  |
| 3 | Change password with verification code | `SecurityPanel` ([`components/features/journey/security-panel.tsx`](../components/features/journey/security-panel.tsx)) | `POST /api/auth/change-password` | [ ] | [ ] | [ ]   | [ ]  |
| 4 | Log out                              | `UserHeaderMenu`                                                                 | `POST /api/auth/logout`       | [ ] | [ ] | [ ]   | [ ]  |
| 5 | **Real SMS / email channel** replaces `MOCK_CODE = "000000"` | `SecurityPanel`                                          | `POST /api/auth/change-password` | [ ] | [ ] | [ ]   | [ ]  |

---

## Persona 3 — Admin

A SeeDAO operator working out of the desktop-first dashboard at `/admin`.

### A1. Process applications end-to-end

**As an admin, I want to** review submitted applications, approve or reject them, settle refunds for rejected-paid users, and assign DIDs to approved users.

| # | Step                                | Page / UI component                                                              | API endpoint                                       | UI  | API | Wired | Test |
|---|-------------------------------------|----------------------------------------------------------------------------------|----------------------------------------------------|-----|-----|-------|------|
| 1 | See queue counts on dashboard       | [`app/admin/(authed)/page.tsx`](../app/admin/(authed)/page.tsx) (stat cards)     | `GET /api/admin/applications` (+ derived counts)   | [ ] | [ ] | [ ]   | [ ]  |
| 2 | Open application list & detail sheet| `ApplicationsTable` ([`components/features/admin/applications-table.tsx`](../components/features/admin/applications-table.tsx)) | `GET /api/admin/applications`                      | [ ] | [ ] | [ ]   | [ ]  |
| 3 | Approve an application              | `ApplicationsTable` action                                                       | `POST /api/admin/applications/[id]/approve`        | [ ] | [ ] | [ ]   | [ ]  |
| 4 | Reject with a (validated) reason    | `ApplicationsTable` action                                                       | `POST /api/admin/applications/[id]/reject`         | [ ] | [ ] | [ ]   | [ ]  |
| 5 | Mark refund completed               | `RefundsTable` ([`components/features/admin/refunds-table.tsx`](../components/features/admin/refunds-table.tsx)) | `POST /api/admin/refunds/[id]/complete`            | [ ] | [ ] | [ ]   | [ ]  |
| 6 | Assign / update DID info            | `DidsTable` ([`components/features/admin/dids-table.tsx`](../components/features/admin/dids-table.tsx)) | `POST /api/admin/dids/[id]/assign`                 | [ ] | [ ] | [ ]   | [ ]  |

### A2. Curate bases

**As an admin, I want to** create, edit, and delete bases (with all their nested sections) so the public explorer stays fresh.

| # | Step                                 | Page / UI component                                                            | API endpoint                              | UI  | API | Wired | Test |
|---|--------------------------------------|--------------------------------------------------------------------------------|-------------------------------------------|-----|-----|-------|------|
| 1 | Browse base list (admin view)        | [`app/admin/(authed)/bases/page.tsx`](../app/admin/(authed)/bases/page.tsx), `BasesAdminTable` | `GET /api/admin/bases`                    | [ ] | [ ] | [ ]   | [ ]  |
| 2 | Create a base via the long form      | [`app/admin/(authed)/bases/new/page.tsx`](../app/admin/(authed)/bases/new/page.tsx), `BaseForm` | `POST /api/admin/bases`                   | [ ] | [ ] | [ ]   | [ ]  |
| 3 | Edit an existing base                | [`app/admin/(authed)/bases/[id]/page.tsx`](../app/admin/(authed)/bases/[id]/page.tsx), `BaseForm` | `GET /api/admin/bases/[id]` + `PUT /api/admin/bases/[id]` | [ ] | [ ] | [ ]   | [ ]  |
| 4 | Delete a base                        | `BaseForm` (sticky bar) / `BasesAdminTable`                                    | `DELETE /api/admin/bases/[id]`            | [ ] | [ ] | [ ]   | [ ]  |

### A3. Curate co-learning events

**As an admin, I want to** maintain co-learning events shown on the public co-learning page.

| # | Step                                 | Page / UI component                                                            | API endpoint                                  | UI  | API | Wired | Test |
|---|--------------------------------------|--------------------------------------------------------------------------------|-----------------------------------------------|-----|-----|-------|------|
| 1 | Browse event list                    | [`app/admin/(authed)/co-learning/page.tsx`](../app/admin/(authed)/co-learning/page.tsx), `CoLearningAdminTable` | `GET /api/admin/co-learning`                  | [ ] | [ ] | [ ]   | [ ]  |
| 2 | Create event via dialog              | `CoLearningAdminTable`                                                         | `POST /api/admin/co-learning`                 | [ ] | [ ] | [ ]   | [ ]  |
| 3 | Edit event                           | `CoLearningAdminTable`                                                         | `PUT /api/admin/co-learning/[id]`             | [ ] | [ ] | [ ]   | [ ]  |
| 4 | Delete event                         | `CoLearningAdminTable`                                                         | `DELETE /api/admin/co-learning/[id]`          | [ ] | [ ] | [ ]   | [ ]  |

---

## Release readiness matrix

A per-journey roll-up. A column is `[x]` only when **every step in that journey** is `[x]` (or `—`) for that column. The right-most column is `[x]` only when the entire row is checked.

| Journey                                  | UI  | API | Wired | Test | v0.1 ready? |
|------------------------------------------|-----|-----|-------|------|-------------|
| G1 Discover community                    | [ ] | [ ] | [ ]   | [ ]  | [ ]         |
| G2 View shared profile                   | [ ] | [ ] | [ ]   | [ ]  | [ ]         |
| M1 Onboard & get approved                | [ ] | [ ] | [ ]   | [ ]  | [ ] (real payment webhook still pending) |
| M2 Maintain my journey                   | [ ] | [ ] | [ ]   | [ ]  | [ ]         |
| M3 Account hygiene                       | [ ] | [ ] | [ ]   | [ ]  | [ ] (real SMS/email channel still pending) |
| A1 Process applications end-to-end       | [ ] | [ ] | [ ]   | [ ]  | [ ]         |
| A2 Curate bases                          | [ ] | [ ] | [ ]   | [ ]  | [ ]         |
| A3 Curate co-learning events             | [ ] | [ ] | [ ]   | [ ]  | [ ]         |

### MVP v0.1 — what's blocking the release

The two annotated rows above expand to:

- [ ] **M1.7** — replace the self-service `POST /api/applications/me/mark-paid` button with a real payment-gateway webhook (see [`docs/testing.md` → Production safety check](./testing.md#production-safety-check)).
- [ ] **M3.5** — replace `MOCK_CODE = "000000"` in `app/api/auth/change-password/route.ts` with a real SMS / email verification channel.

Cross-cutting prep that any release also needs (tracked separately, not per journey):

- [ ] Replace the file-based fake DB in [`lib/features/_shared/fake-db.ts`](../lib/features/_shared/fake-db.ts) with a real database.
- [ ] Confirm `NODE_ENV=production` returns 403 from `/api/dev/seed` and `/api/dev/login-as`.
- [ ] Confirm the yellow "开发环境一键登录" panel does not render on `/login` or `/admin/login` in a production build.

---

## Out of scope for v0.1 (future release columns)

These are intentionally **not** part of the v0.1 readiness signal. They will become their own columns or appendix when we plan v0.2:

- Production hardening beyond the items called out above (rate limiting, audit logs, observability).
- Design polish & responsive review (visual QA on small phones, large desktop, dark mode).
- i18n (currently zh-CN copy is hard-coded).
- Real map library to replace the `BasesMap` placeholder.

---

## How to update this doc

When you **add a journey step**:
1. Find the persona section it belongs to (Guest / Member / Admin).
2. Append a row to that journey's table with the page/component path and API endpoint.
3. Tick `UI` / `API` / `Wired` / `Test` as you complete each.
4. If the step lives entirely outside the v0.1 scope, add it but leave all four boxes `[ ]` and add a note in **MVP v0.1 — what's blocking the release**.

When you **add a whole new journey**:
1. Add a new `### G/M/A<n>. Title` heading with a one-sentence "As a … I want to …" narrative.
2. Add the steps table.
3. Add a new row to the **Release readiness matrix** appendix.

When you **add a new page or endpoint**, the maintenance reminders in [`docs/api.md`](./api.md) and [`docs/ui.md`](./ui.md) will point you back here — keep all three docs in sync.
