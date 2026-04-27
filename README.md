# SeeDAO 2.0

A community platform for nomads & in-place co-creators built on Next.js 16, React 19, Tailwind v4 and shadcn/ui.

## Features

- **Public landing, base explorer, co-learning calendar** — accessible to guests.
- **Registered users** — submit applications (with payment + DID flow), edit a multi-section "我的旅程" profile, manage privacy and share via QR.
- **Admin dashboard** at `/admin` — application review, refunds, DID assignment, base CRUD, co-learning event CRUD.
- Mobile-first user UI / desktop-first admin UI.
- Centralized design tokens in `lib/design-tokens.ts` — change colors and fonts in one place.
- File-based fake DB in `.data/` for prototyping. Drop in a real database by re-implementing `lib/features/_shared/fake-db.ts`.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (dev only)

The login pages show a yellow "开发环境一键登录" panel with one-click buttons for the demo accounts. Clicking a button auto-seeds the fake DB on first use.

| Account | Credentials | Where |
|--------|-------------|-------|
| Admin | `admin@seedao.local` / `admin123` | `/admin/login` |
| Alice (approved user with full journey) | `alice@seedao.local` / `hello123` | `/login` |
| Bob (application pending review) | `+8613800000002` / `hello123` | `/login` |

You can also manually reset all demo data:

```bash
curl 'http://localhost:3000/api/dev/seed?reset=1'
```

In production builds both `/api/dev/seed` and `/api/dev/login-as` are gated behind a `DEMO_RESET_TOKEN` env var (set in Vercel) — see [`docs/deploy.md`](./docs/deploy.md). Without the token they return 403.

## Project structure

```
app/
  (public)/         # mobile-first guest pages: landing, bases, co-learning, share
  (auth)/           # login + register
  (user)/           # authenticated user pages: /journey, /account
  admin/
    login/          # admin login (separate entrypoint)
    (authed)/       # admin dashboard, applications, refunds, dids, bases, co-learning
  api/              # route handlers
lib/
  design-tokens.ts  # single source of truth for colors / fonts / radii / spacing
  features/         # feature-sliced repos + zod schemas
    _shared/        # enums, fake-db, validators
    auth/ applications/ journey/ bases/ co-learning/
components/
  ui/               # shadcn primitives
  layout/           # user-shell, admin-shell, navs
  features/         # feature-specific UI components
proxy.ts            # role-based access control (Next.js 16 proxy/middleware)
```

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

## Documentation

- [`docs/journeys.md`](./docs/journeys.md) — user-journey-based release tracker (start here for MVP v0.1 status) · [中文版](./docs/journeys.zh-CN.md)
- [`docs/ui.md`](./docs/ui.md) — page-by-page UI component checklist
- [`docs/api.md`](./docs/api.md) — API endpoint reference
- [`docs/testing.md`](./docs/testing.md) — test accounts and manual test scenarios
- [`docs/schema.md`](./docs/schema.md) — data model + suggested SQL schema (handoff for the backend dev)
- [`docs/deploy.md`](./docs/deploy.md) — deploy this prototype to Vercel with writable demo data

## Customizing the design system

Edit `lib/design-tokens.ts` and the matching CSS variables in `app/globals.css`. Both light and dark palettes are defined in `oklch`. Fonts (Noto Sans SC, Noto Serif SC, Geist Mono) are wired up in `app/layout.tsx`.

### Typography

The font scale is semantic, not absolute — call sites write `text-h1`, `text-body`, `text-caption`, etc. and never `text-2xl`/`text-sm`. Each token bakes in a tuned `line-height`, `letter-spacing` and `font-weight`, so an `<h1>` already renders correctly without `font-serif font-bold` on every page.

| Token | Size | Use for |
|-------|------|---------|
| `text-display` | clamp 36–48px / 800 / serif (apply manually) | landing hero only |
| `text-h1` (default `<h1>`) | 34px / 700 / serif | page titles |
| `text-h2` (default `<h2>`) | 28px / 700 / serif | section headers |
| `text-h3` (default `<h3>`) | 22px / 700 / serif | card titles |
| `text-h4` (default `<h4>`) | 18px / 600 / serif | inline section titles |
| `text-body-lg` | 16px / 400 | lead paragraphs |
| `text-body` (default `<body>`) | 14px / 400 | descriptions, labels, tables |
| `text-body-sm` | 13px / 400 | dense lists, table cells |
| `text-caption` | 12px / 400 | meta, footnotes |
| `text-overline` | 11px / 600 / +0.08em | uppercase eyebrows |

To re-tune the scale, change values in `tokens.typography.scale` (`lib/design-tokens.ts`) **and** the matching `--text-*` variables in `app/globals.css` — they are a manual mirror so the typed object can document/autocomplete in editors while Tailwind v4 actually consumes the CSS variables.

## Adding a new feature

1. Create `lib/features/<name>/` with `schema.ts` (zod), `repo.ts` (fake-db access).
2. Add API routes under `app/api/<name>/`.
3. Add UI under `components/features/<name>/` and pages in the relevant route group.
4. Optionally add a tag/enum in `lib/features/_shared/enums.ts`.
