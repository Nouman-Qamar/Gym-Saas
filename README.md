# Ironline — Gym Management SaaS

A full-stack, multi-tenant gym management platform: admin console, trainer
workspace, and a member-facing app with a playful, gender-adaptive theme —
installable as a real app on both phone and laptop (PWA).

---

## 1. What's actually in here

This isn't the static preview anymore — it's a working product with a real
database, real authentication, and real business logic:

- **Multi-tenant**: any number of gyms, each with its own admin, trainers,
  members, plans, classes, and data — fully isolated by gym.
- **Auth**: email/password with hashed passwords (bcrypt) and secure
  httpOnly session cookies (JWT). No third-party auth service required.
- **Roles**: Admin (gym owner/manager), Trainer, Member — each gets its own
  dashboard, navigation, and permissions, enforced both at the routing layer
  and inside every server action.
- **Admin console**: members, payments, attendance, trainers, workout
  library, announcements, analytics/reports (revenue trend, membership mix,
  attendance-by-hour), gym settings.
- **Trainer workspace**: member roster, build & assign workout plans, class
  schedule, progress tracking, direct messaging.
- **Member app**: personalized dashboard, workout plans & logging (with a
  confetti celebration on completion), class booking, QR check-in, body
  metrics/progress charts, streaks & badges, a challenge leaderboard,
  referrals, messaging with trainers.
- **Gendered theming ("vibes")**: onboarding asks for gender and gives each
  user a distinct visual identity out of the box — Baddie (hot pink/rose
  gold) for women, Ember (coral/near-black) for men, Electric (cyan/indigo)
  as a neutral option — and anyone can override their vibe anytime from
  their profile, independent of gender.
- **Installable app (PWA)**: add it to your home screen on a phone or
  install it as a desktop app on a laptop — it behaves like a native app
  (own icon, own window, offline-friendly shell), not just a website.
- **Forgot/reset password**: a real token-based flow (1-hour expiry,
  single-use) — not just login.
- **Real online payments**: members can pay outstanding balances from the
  app via Stripe or JazzCash (Pakistan) — see §3 to activate. Without a
  gateway configured, admins still fall back to marking payments paid
  manually, exactly as before.
- **Email + SMS notifications**: welcome emails, payment reminders, and
  class-booking confirmations — sent for real once you add provider keys
  (§3), and safely logged to the console + database otherwise so nothing
  breaks in a fresh checkout.
- **Push notifications**: a real Web Push subscription flow (not just PWA
  offline caching) — announcements and payment reminders can reach a
  member's device even when the app isn't open, once VAPID keys are set.
- **Platform-owner console** (`/platform/login`): a separate, SaaS-level
  login for whoever runs Ironline itself — lists every gym on the platform
  with member/staff counts and revenue, and a per-gym detail view. Fully
  isolated from gym-level accounts (its own session, its own login) so it
  doesn't require making any gym-scoped data nullable.

---

## 2. Do you need a database? Yes — Postgres.

You were right to think Postgres. This app is genuinely stateful (members,
payments, attendance, workout logs, messages, etc.), so it needs a real
database — there's nothing to "turn on" instead of that. The good news is
setup is simple and it only needs to happen once.

**Option A — already have Postgres installed locally:**

```bash
createdb gymsaas
```

**Option B — easiest path, Docker:**

```bash
docker run --name gymsaas-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=gymsaas -p 5432:5432 -d postgres:16
```

**Option C — hosted/free Postgres** (Neon, Supabase, Railway, etc.) — just
grab the connection string they give you.

Whichever you pick, you end up with one connection string, which goes in
the single `.env` file described next.

---

## 3. One `.env` file — that's it

Everything the app needs to run lives in **one** `.env` file at the project
root. Copy the example and fill in your own values:

```bash
cp .env.example .env
```

```ini
# .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gymsaas?schema=public"
AUTH_SECRET="replace-with-a-long-random-string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Ironline"
```

- `DATABASE_URL` — your Postgres connection string from step 2.
- `AUTH_SECRET` — any long random string, used to sign session tokens.
  Generate one with `openssl rand -base64 32`.
- `NEXT_PUBLIC_APP_URL` — the URL the app is served from. Change this to
  your real domain when you deploy (also used to build QR check-in links).
- `NEXT_PUBLIC_APP_NAME` — shown in the UI, PWA install prompt, etc.

There is no second config file, no `.env.local` vs `.env.production` to
juggle for local development — one file, one source of truth.

### Optional: email, SMS, push, and online payments

None of these are required to run the app — every one of them degrades
gracefully to a console-log (and a database record in `notification_log`)
when its keys are blank, so you can develop and demo the whole product
before signing up for anything. Add keys later, any time, with zero code
changes:

| Feature | Env vars | Where to get them |
|---|---|---|
| Email (welcome, payment reminders, reset links) | `RESEND_API_KEY`, `EMAIL_FROM` | [resend.com](https://resend.com) |
| SMS (payment reminders) | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | [twilio.com](https://twilio.com) |
| Web push (announcements, reminders) | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | generate your own — no account needed: `npx web-push generate-vapid-keys` |
| Online payments | `PAYMENT_GATEWAY` (`stripe` \| `jazzcash` \| `off`) + the matching keys below | |
| — Stripe | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | [stripe.com](https://stripe.com) → Developers → API keys (use test keys first) |
| — JazzCash (Pakistan) | `JAZZCASH_MERCHANT_ID`, `JAZZCASH_PASSWORD`, `JAZZCASH_INTEGRITY_SALT` | your JazzCash merchant dashboard (sandbox or live) |

EasyPaisa is scaffolded (`lib/payments/easypaisa.ts`) but deliberately left
as a clear "not implemented" stub rather than a guessed integration —
plug in the real API once you have their integration docs in hand.

Admin → Settings shows a live "Off / Needs setup / Connected" badge for
whichever payment gateway is selected, so it's obvious at a glance whether
members can actually pay online yet.

---

## 4. Running it

```bash
npm run setup     # installs deps, runs DB migrations, seeds demo data
npm run dev        # starts the app at http://localhost:3000
```

`npm run setup` runs three things for you (you can also run them
individually):

```bash
npm install
npm run db:migrate   # creates all tables in your Postgres database
npm run db:seed      # loads realistic demo data (see below)
```

### Demo login credentials (seeded automatically)

| Role    | Email               | Password      |
|---------|----------------------|---------------|
| Admin   | admin@demo.gym       | demopass123   |
| Trainer | trainer@demo.gym     | demopass123   |
| Member  | member@demo.gym      | demopass123   |

New members can also self-signup and join the demo gym using join code
**`demo-gym`**.

The seed also creates one **platform owner** account — this is a separate
login from the three above, for whoever runs Ironline itself rather than
a single gym:

| Console | URL | Email | Password |
|---|---|---|---|
| Platform owner | `/platform/login` | owner@ironline.app | demopass123 |

### Other useful scripts

```bash
npm run build         # production build
npm run start          # run the production build
npm run db:studio      # visual database browser (Drizzle Studio)
npm run db:generate    # generate a new migration after editing lib/db/schema.ts
npm run lint            # lint the codebase
```

---

## 5. Installing it as an app

### On a phone (iOS/Android)

1. Open the app's URL in Safari (iOS) or Chrome (Android).
2. Log in as usual.
3. iOS: tap the Share icon → **Add to Home Screen**.
   Android: tap the browser menu → **Install app** (or you'll see an
   automatic install prompt).
4. It now opens full-screen from your home screen with its own icon — no
   browser bar, and it remembers your session.

### On a laptop/desktop (Windows/Mac/Linux)

1. Open the app's URL in Chrome, Edge, or another Chromium-based browser.
2. Click the **install icon** in the address bar (or browser menu →
   **Install Ironline...**).
3. It now runs as its own application window, has its own taskbar/dock
   icon, and launches independently of your browser.

This works because the app ships a real Web App Manifest and service
worker — it's a genuine installable PWA, not a bookmark.

---

## 6. Deploying for real (beyond your own machine)

To make this reachable outside your machine you need:

1. **A public Postgres database** (Neon, Supabase, Railway, Render, RDS,
   etc.) — put its connection string in `DATABASE_URL`.
2. **A host for the Next.js app** — Vercel is the simplest for this stack
   (`vercel deploy`), or any Node host (Railway, Render, Fly.io, a VPS).
3. **Update `.env` for production**: set `NEXT_PUBLIC_APP_URL` to your real
   domain (e.g. `https://ironline.yourgym.com`) and generate a fresh
   `AUTH_SECRET`. On most hosts you'll set these as dashboard environment
   variables rather than committing a `.env` file — same variables either
   way.
4. Run `npm run db:migrate` once against the production database (and
   `npm run db:seed` only if you actually want the demo data there — for a
   real gym you'd skip seeding and just use "Create your gym" on the
   signup page instead).

---

## 7. Architecture notes (why things are built this way)

- **Next.js 16 (App Router) + React 19** — server components by default,
  server actions for all writes (no separate API layer to maintain), and
  edge-runtime route protection via `proxy.ts`.
- **Drizzle ORM + PostgreSQL** — a lightweight, fully-typed SQL layer.
  Migrations are plain SQL files generated from `lib/db/schema.ts`, so
  there's no opaque binary/codegen step involved in changing the schema.
- **Custom auth (bcrypt + JWT session cookies)** — no dependency on a
  third-party auth provider or paid service; everything runs on your own
  database.
- **Tailwind CSS v4** — theme tokens (colors, spacing) are CSS variables,
  which is what makes the three gender/vibe themes swap instantly with a
  single `data-theme` attribute and zero flash-of-wrong-theme.
- **PWA** — `app/manifest.ts` + `public/sw.js` give installability and a
  resilient offline app shell without any third-party PWA toolkit.

---

## 8. Project structure

```
app/                 # routes (App Router) — (auth)/, admin/, trainer/, member/, platform/
app/api/payments/    # Stripe webhook + JazzCash return-URL route handlers
components/ui/       # shared UI: sidebar, cards, charts, motion primitives, theme picker, etc.
lib/db/               # Drizzle schema, client, migrations, seed script
lib/auth/             # password hashing, gym-staff sessions, platform-owner sessions
lib/actions/          # server actions (all writes), grouped by role
lib/queries/          # server-only read queries, grouped by role
lib/notify/           # email / SMS / push senders (console-log fallback when unconfigured)
lib/payments/         # gateway-agnostic checkout abstraction + Stripe/JazzCash/EasyPaisa adapters
public/               # PWA icons, manifest assets, service worker (push + offline shell)
proxy.ts              # edge-runtime auth/role route guard (Next 16's proxy.ts)
```

---

## 9. Optional: automated QA

Two complementary layers:

**Unit tests** (Vitest) — fast, no database or browser: money formatting,
password hashing, the payment-gateway adapters (including a JazzCash
checkout → return round trip that catches a tampered hash).

```bash
npm run test          # run once
npm run test:watch    # watch mode
```

**End-to-end smoke test** (Playwright) — logs in as every demo role
(admin, trainer, member, and the platform owner), walks every page, and
exercises the forgot/reset-password flow and the platform-owner's
gym-detail drilldown, checking for console errors and failed requests
along the way:

```bash
npx playwright install chromium   # first time only
npm run db:seed                   # needs the demo data
next dev -p 3100                  # run on 3100 so it doesn't clash with `npm run dev`
npm run test:e2e                  # in another terminal
```
