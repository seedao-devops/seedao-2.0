# Testing & Demo Accounts

This project ships with three demo accounts and a one-click login UI for fast manual testing. The yellow quick-login panel is dev-only (gated by `NODE_ENV !== "production"`); the underlying `/api/dev/seed` and `/api/dev/login-as` endpoints are open in dev and gated behind a `DEMO_RESET_TOKEN` env var in production builds. See [`docs/deploy.md`](./deploy.md).

## Demo accounts

Defined in `lib/features/_shared/seed.ts`.

| Key | Role | Identity | Password | State |
|---|---|---|---|---|
| `admin` | admin | `admin@seedao.local` | `admin123` | — |
| `alice` | user | `alice@seedao.local` (also phone `+8613800000001`) | `hello123` | Application **APPROVED**, DID `did:seedao:alice#1` assigned, full journey populated |
| `bob` | user | `+8613800000002` | `hello123` | Application **PENDING** review |

The first time any of these accounts is used, the fake DB is auto-seeded with:
- 3 users (above)
- 3 bases (大理沙溪, 厦门曾厝垵, 安吉竹林书院)
- 3 co-learning events (one per base, one per level type)
- 2 applications (Alice approved, Bob pending)
- 1 journey (Alice's)

Demo data is persisted in `.data/*.json` and is gitignored.

---

## How to log in

### Option 1 — One-click login (recommended)

Each login page renders a yellow "**开发环境一键登录**" panel at the bottom in dev mode:

- Visit [`/login`](http://localhost:3000/login) → click **Alice** or **Bob**
- Visit [`/admin/login`](http://localhost:3000/admin/login) → click **Admin**

The button:
1. Calls `POST /api/dev/login-as` with the chosen key
2. Auto-seeds the DB on first use
3. Sets the session cookie server-side
4. Redirects to the appropriate landing page (`/journey` for users, `/admin` for admin)

### Option 2 — Type the credentials

Use the table above with the regular login forms. Same outcome.

### Option 3 — Reset everything

```bash
curl 'http://localhost:3000/api/dev/seed?reset=1'
```

This wipes and reseeds all five tables. Useful when:
- You've edited demo data through the admin UI and want a clean slate
- You changed `seed.ts` and want the new values to apply
- The `.data/` files are corrupted somehow

---

## Manual test scenarios

### As **Alice** (approved user)
- ✅ View her own journey at `/journey`
- ✅ Edit profile, stays, works, etc. at `/account` → 资料编辑
- ✅ Toggle visibility of profile sections at `/account` → 分享设置
- ✅ Get a public share URL + QR code; open it in incognito to confirm hidden fields are stripped
- ✅ Change password at `/account` → 安全设置 (verification code is `000000`)
- ✅ Logout via the user dropdown menu in the top header

### As **Bob** (pending application)
- ✅ Visit `/register` to see the **`ApplicationStatus`** view (timeline, payment status)
- ✅ Click "标记已付款" to flip his payment status — Alice can then see Bob in the admin queue
- ✅ Cannot access `/journey` until admin approves and assigns DID

### As **Admin**
- ✅ Approve Bob at `/admin/applications` → his status becomes `APPROVED`, `didStatus=PENDING_ASSIGN`
- ✅ Reject Bob with a reason → his status becomes `REJECTED_AWAITING_REFUND` (if previously paid)
- ✅ Complete the refund at `/admin/refunds`
- ✅ Assign a DID at `/admin/dids` → Bob can now see his DID on the application timeline
- ✅ Create / edit / delete a base at `/admin/bases`
- ✅ Create / edit / delete a co-learning event at `/admin/co-learning`
- ✅ Logout via the header button

### As a **guest** (logged out)
- ✅ Browse `/`, `/bases`, `/bases/[id]`, `/co-learning` freely
- ✅ Click any "我的旅程" / "我的" tab → redirected to `/login` with `?redirect=` preserved
- ✅ Visit a public share URL `/share/[id]` → see only the visible fields

---

## Resetting your local state

| What you want | Command |
|---|---|
| Clean session cookie only | Click logout, or clear cookies for `localhost:3000` |
| Reset demo data only | `curl 'http://localhost:3000/api/dev/seed?reset=1'` |
| Wipe everything from scratch | `rm -rf .data && rm -rf .next && npm run dev` (then trigger seed by clicking any quick-login button) |

---

## Production safety check

Before shipping to a real (non-demo) audience:
- [ ] Confirm `/api/dev/seed` and `/api/dev/login-as` are token-gated in production (either set `DEMO_RESET_TOKEN` to a strong secret you control, or remove the routes entirely). Test with `npm run build && npm start` and curling without the token — should return 403.
- [ ] Confirm the yellow "开发环境一键登录" panel does NOT render on `/login` or `/admin/login` in a production build.
- [ ] Replace the `MOCK_CODE = "000000"` in `app/api/auth/change-password/route.ts` with a real SMS / email verification channel.
- [ ] Replace the prototype storage in `lib/features/_shared/fake-db.ts` (file-based locally, Upstash Redis on the Vercel demo) with a real database — see [`docs/schema.md`](./schema.md).
- [ ] Set `AUTH_SECRET` to a random 32+ byte secret (the Vercel demo intentionally leaves it at the insecure literal — see [`docs/deploy.md`](./deploy.md)).
- [ ] Replace the "标记已付款" self-service button (`POST /api/applications/me/mark-paid`) with a real payment-gateway webhook.
