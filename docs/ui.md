# UI Component Inventory

Complete checklist of every page in the app and the components it owns. Use this to scope work, audit coverage, or onboard a new frontend engineer.

Conventions:
- Pages live under `app/` (route groups in parentheses don't appear in the URL).
- Reusable feature UI lives under `components/features/<feature>/`.
- Layout chrome lives under `components/layout/`.
- Primitives (buttons, inputs, dialogs, etc.) live under `components/ui/` (shadcn).

---

## Layout chrome (visible on every page in its scope)

### User shell — `components/layout/user-shell.tsx`
Wraps every page in `app/(public)/` and `app/(user)/`. Mobile-first, max-w-md.

- [ ] **Top brand bar** — `components/layout/user-shell.tsx`
  - SeeDAO wordmark (links to `/`)
  - Guest: "登录" link
  - Authenticated: user dropdown menu
- [ ] **User header menu** — `components/layout/user-header-menu.tsx`
  - Identity label (email or phone)
  - "账户设置" → `/account`
  - "我的旅程" → `/journey`
  - "退出登录" (calls `POST /api/auth/logout`)
- [ ] **Bottom tab bar** — `components/layout/user-bottom-nav.tsx`
  - 探索基地 / 共学 / 我的旅程 / 我的

### Admin shell — `components/layout/admin-shell.tsx`
Wraps every page in `app/admin/(authed)/`. Desktop-first, fixed sidebar.

- [ ] **Sidebar** — `components/layout/admin-sidebar.tsx`
  - 申请审核 / 退款 / DID 分配 / 基地管理 / 共学活动
- [ ] **Header** — `components/layout/admin-header.tsx`
  - Admin email
  - Logout button

---

## Public pages

### `/` — Landing — `app/(public)/page.tsx`
- [ ] Hero copy + CTAs (注册 / 登录 / 探索基地)
- [ ] Feature highlights cards

### `/bases` — Base explorer — `app/(public)/bases/page.tsx`
- [ ] **`BasesExplorer`** — `components/features/bases/bases-explorer.tsx`
  - Search input
  - Tag / province / skill filter chips
  - Base cards list
- [ ] **`BasesMap`** — `components/features/bases/bases-map.tsx`
  - Province-grouped placeholder; replace with proper map library when ready

### `/bases/[id]` — Base detail — `app/(public)/bases/[id]/page.tsx`
- [ ] Hero (emoji, name, location, tags)
- [ ] Description block
- [ ] Local life sections (住宿 / 共享工位 / 周边)
- [ ] Skills offered / needed badges
- [ ] Local projects cards
- [ ] Co-learning events at this base
- [ ] Timeline list
- [ ] Produced works (joined from journeys)
- [ ] "申请入住" CTA

### `/co-learning` — Co-learning explorer — `app/(public)/co-learning/page.tsx`
- [ ] **`CoLearningExplorer`** — `components/features/co-learning/co-learning-explorer.tsx`
  - Search input
  - Skill / level filters
  - Event cards (name, instructor, base, period, level badge)

### `/share/[id]` — Public profile — `app/(public)/share/[id]/page.tsx`
- [ ] **`JourneyView`** (read-only mode, server-filtered by visibility) — `components/features/journey/journey-view.tsx`

---

## Auth pages

### `/login` — User login — `app/(auth)/login/page.tsx`
- [ ] Phone / email tab switcher (`Tabs`)
- [ ] Phone form (with validation)
- [ ] Email form (with validation)
- [ ] Submit button
- [ ] Link to `/register`
- [ ] **`DevQuickLogin`** (filter="user") — `components/features/auth/dev-quick-login.tsx`

### `/register` — Application & registration — `app/(auth)/register/page.tsx`
Renders different content depending on session/application state:
- [ ] **`RegisterWizard`** (no session) — `components/features/applications/register-wizard.tsx`
  - Step 1: credentials (phone/email + password)
  - Step 2: nickname + self-intro
  - Step 3: interest tags + portfolio URL
  - Step 4: review + submit
- [ ] **`ApplicationStatus`** (after submission) — `components/features/applications/application-status.tsx`
  - Payment status card + "标记已付款" button
  - Review timeline (待审核 → 通过 / 拒绝 → DID 分配)
  - Refund timeline if rejected

### `/admin/login` — Admin login — `app/admin/login/page.tsx`
- [ ] Email + password form
- [ ] **`DevQuickLogin`** (filter="admin")

---

## Authenticated user pages

### `/journey` — My journey — `app/(user)/journey/page.tsx`
- [ ] **`JourneyView`** (own profile, full data) — `components/features/journey/journey-view.tsx`
  - Avatar
  - Display name + bio
  - Stays
  - Learning records
  - Teaching records
  - Works
  - Wish to learn
  - "编辑" link to `/account`

### `/account` — Account management — `app/(user)/account/page.tsx`
- [ ] **`AccountTabs`** — `components/features/journey/account-tabs.tsx`

  Tab 1: 资料编辑
  - [ ] **`ProfileEditor`** — `components/features/journey/profile-editor.tsx`
    - Avatar picker (DiceBear seed)
    - Display name + bio
    - Stays array editor
    - Learning record array editor
    - Teaching record array editor
    - Works array editor
    - Wish-to-learn array editor

  Tab 2: 安全设置
  - [ ] **`SecurityPanel`** — `components/features/journey/security-panel.tsx`
    - Bound contact display
    - Send code button (mock — code is `000000`)
    - Code input
    - New password input
    - Logout button (also available from header menu)

  Tab 3: 分享设置
  - [ ] **`SharePanel`** — `components/features/journey/share-panel.tsx`
    - Visibility toggles per profile section
    - Share URL display + copy button
    - QR code (`qrcode.react`)

---

## Admin pages

### `/admin` — Dashboard — `app/admin/(authed)/page.tsx`
- [ ] Stat cards: 待审核申请 / 待处理退款 / 待分配 DID / 基地数 / 活动数 (each links to detail page)

### `/admin/applications` — Application review — `app/admin/(authed)/applications/page.tsx`
- [ ] **`ApplicationsTable`** — `components/features/admin/applications-table.tsx`
  - Sortable list
  - Detail sheet (`Sheet`) showing applicant + intro + tags + portfolio
  - Approve / reject actions
  - Reject requires a reason (validated)

### `/admin/refunds` — Refund queue — `app/admin/(authed)/refunds/page.tsx`
- [ ] **`RefundsTable`** — `components/features/admin/refunds-table.tsx`
  - List of `REJECTED_AWAITING_REFUND` applications
  - "标记完成退款" action

### `/admin/dids` — DID assignment — `app/admin/(authed)/dids/page.tsx`
- [ ] **`DidsTable`** — `components/features/admin/dids-table.tsx`
  - List of approved-but-unassigned applications
  - Dialog to assign / update DID info

### `/admin/bases` — Base list — `app/admin/(authed)/bases/page.tsx`
- [ ] "新建基地" link → `/admin/bases/new`
- [ ] **`BasesAdminTable`** — `components/features/admin/bases-admin-table.tsx`
  - Edit / delete actions

### `/admin/bases/new` & `/admin/bases/[id]` — Base form — `app/admin/(authed)/bases/{new,[id]}/page.tsx`
- [ ] **`BaseForm`** — `components/features/admin/base-form.tsx`
  - 基本信息: emoji, name, province (Select), city, description, tags (TagPicker), apply URL
  - 在地生活: accommodations / coworking / tourism array editors
  - 技能交换: skillsOffered / skillsNeeded TagPickers
  - 在地项目: nested project cards (status, description, required skills, period)
  - 时间线: timeline entry cards (emoji, date, title, description)
  - Sticky save / delete bar

### `/admin/co-learning` — Event management — `app/admin/(authed)/co-learning/page.tsx`
- [ ] **`CoLearningAdminTable`** — `components/features/admin/co-learning-admin-table.tsx`
  - List with edit / delete
  - Create / edit dialog form

---

## Shared primitives in use

From `components/ui/`:
`avatar`, `alert`, `badge`, `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `pagination`, `popover`, `radio-group`, `select`, `separator`, `sheet`, `skeleton`, `sonner` (Toaster), `switch`, `table`, `tabs`, `tag-picker`, `textarea`.

Editing any of these affects every page that uses them — verify visually after changes.

---

## Maintenance checklist

When you add a new page:
- [ ] Decide route group: `(public)` / `(user)` / `admin/(authed)`
- [ ] If under `(user)` or `admin/(authed)`, the proxy + layout already enforce auth
- [ ] Put feature-specific UI under `components/features/<feature>/`
- [ ] Add an entry to this file under the appropriate section
- [ ] Add a row to `docs/api.md` if you create new endpoints
- [ ] Tick (or add) the matching row in [`docs/journeys.md`](./journeys.md) so the release tracker stays accurate
