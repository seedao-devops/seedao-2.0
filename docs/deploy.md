# Deploying SeeDAO 2.0 to Vercel (demo)

This is the **prototype** deploy guide: a public demo that has data writes
working end-to-end, without standing up a real database. Data lives in
[Upstash Redis](https://upstash.com/) (one Redis key per "table", value = the
whole table as JSON), seeded automatically on first read.

For the eventual production migration to a real DB, see [`docs/schema.md`](./schema.md).

## What changes between local dev and the Vercel demo

| Concern        | Local dev                 | Vercel demo                                         |
| -------------- | ------------------------- | --------------------------------------------------- |
| Storage        | JSON files in `.data/`    | Upstash Redis (one key per table)                   |
| Selection      | Default                   | Auto-selected when `UPSTASH_REDIS_REST_URL` is set  |
| Demo seed      | Manual via `?reset=1`     | Auto on first read when `AUTO_SEED=1`               |
| Dev endpoints  | Open                      | Token-gated via `DEMO_RESET_TOKEN`                  |
| Quick-login UI | Visible (yellow panel)    | Hidden (gated on `NODE_ENV !== "production"`)       |

Public API of the storage layer (`getTable / saveTable / updateTable` in
[`lib/features/_shared/fake-db.ts`](../lib/features/_shared/fake-db.ts)) is
identical for both backends, so feature repos don't care which one is live.

## Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables**.

| Variable                                                  | Required for | Source                                                       | Notes                                                                 |
| --------------------------------------------------------- | ------------ | ------------------------------------------------------------ | --------------------------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL` **or** `KV_REST_API_URL`         | Production   | Vercel Marketplace database integration (auto)               | Presence of either flips storage to Redis. See note on naming below.  |
| `UPSTASH_REDIS_REST_TOKEN` **or** `KV_REST_API_TOKEN`     | Production   | Vercel Marketplace database integration (auto)               | Server-side write token, never exposed to the client.                 |
| `DEMO_RESET_TOKEN`                                        | Production   | You generate (e.g. `openssl rand -hex 32`)                   | Required to call `/api/dev/seed` and `/api/dev/login-as` in prod.     |
| `AUTO_SEED`                                               | Production   | Set to `1`                                                   | Triggers a one-shot seed on the first read of `users/bases/coLearningEvents`. |

> **On the two naming schemes:** Vercel's Storage marketplace ships the same
> Upstash Redis backend under two tiles. The "Upstash" tile injects
> `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. The "Marketplace
> database" / "Vercel KV" tile injects `KV_REST_API_URL` / `KV_REST_API_TOKEN`.
> The dispatcher in [`lib/features/_shared/fake-db.ts`](../lib/features/_shared/fake-db.ts)
> accepts either pair (Upstash names take precedence if both are present), so
> you don't need to rename anything regardless of which tile you picked.

### Vars Vercel may also inject — **unused** by this app

If your integration also dropped these, you can ignore them; nothing in this
codebase reads them:

- `KV_URL`, `REDIS_URL` — `rediss://` TCP connection strings. The
  `@upstash/redis` client is HTTP-only and doesn't use them.
- `KV_REST_API_READ_ONLY_TOKEN` — read-only token. The app does writes
  (seeds + journey edits + admin CRUD), so the full read/write token is
  required.

### Intentionally **not** set for this demo

| Variable      | Why it's omitted                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AUTH_SECRET` | This deploy is a demo only — no real users, no sensitive data. The fallback in [`lib/features/auth/jwt.ts`](../lib/features/auth/jwt.ts) is fine. **If you ever expose this URL to a real audience, set `AUTH_SECRET` to a random 32+ byte secret and rotate.** |

## One-time Vercel setup

1. Push this repo and import it in Vercel (`Add New… → Project`). Framework
   auto-detects as Next.js. Build command and output dir: leave as defaults.
2. Open the project's **Storage** tab → **Create Database** → pick any
   **Upstash Redis**-backed tile from the Marketplace (either "Upstash" or
   "Marketplace database / KV" works — the dispatcher accepts both naming
   schemes). Choose a region close to your Vercel region.
3. Open **Settings → Environment Variables** and add:
   - `DEMO_RESET_TOKEN` → some random string (keep it; you'll use it below).
   - `AUTO_SEED` → `1`.
4. Trigger a deploy (`Deployments → Redeploy`) so the new env vars take effect.

> **Diagnostic tip:** if `/bases` returns 500 on the first visit, check the
> Vercel Function logs for the line
> `[fake-db] No Upstash REST env vars found ...`. If you see it, neither
> env-var pair was visible to the running function — fix by adding the
> Upstash integration to the **Production** environment specifically and
> redeploying.

## Verify the deploy

After the deploy goes green:

1. Visit `https://<your-deploy>/bases`. The page reads `bases` from Redis;
   because the table is empty on first read and `AUTO_SEED=1`, the seed runs
   automatically. You should see three demo bases.
2. Visit `https://<your-deploy>/login`. Sign in as
   `alice@seedao.local` / `hello123`.
3. Edit something in `/journey` (e.g. bio), reload — change should persist.
   That confirms writes are reaching Redis.
4. Optional manual reset later:
   ```bash
   curl 'https://<your-deploy>/api/dev/seed?reset=1&token=<DEMO_RESET_TOKEN>'
   ```
   Or via header:
   ```bash
   curl -H "Authorization: Bearer <DEMO_RESET_TOKEN>" \
     'https://<your-deploy>/api/dev/seed?reset=1'
   ```

## What the dev/quick-login panel does in production

The yellow "开发环境一键登录" panel in
[`components/features/auth/dev-quick-login.tsx`](../components/features/auth/dev-quick-login.tsx)
checks `NODE_ENV` client-side and renders **nothing** in production. Casual
visitors won't see one-click logins. If you want one-click logins for demo
visitors, swap that gate to a `NEXT_PUBLIC_DEMO_MODE` env var — out of scope
for this deploy.

## Known caveats

- **Cross-instance write races.** `withLock` in
  [`lib/features/_shared/fake-db.ts`](../lib/features/_shared/fake-db.ts) only
  serializes writes within a single serverless instance. Two instances racing
  on the same table will last-writer-wins. Acceptable for low-traffic demo;
  harden with Redis `WATCH/MULTI` if needed.
- **Upstash 1MB value limit.** Each table is one Redis value. Comfortably
  above the current demo seed; revisit if any table grows past a few hundred
  rows. The clean migration path is `docs/schema.md`.
- **Forgeable JWTs.** The fallback `AUTH_SECRET` is hard-coded in source.
  Anyone who reads the public source can mint admin tokens. Demo-only.

## Going to a real backend

When you're ready to drop the prototype storage entirely, follow the
**Migration recipe** at the bottom of [`docs/schema.md`](./schema.md).
