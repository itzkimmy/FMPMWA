# Build Brief: StudioLedger — Personal Booking & Wage Manager

Paste this into Antigravity as the initial project prompt. It works together with
`AGENTS.md` (agent behavior rules) and `SKILLS.md` (domain/feature reference) —
place all three at the repo root before starting.

---

## 1. What we're building

A **single-user, personal web app** for a freelance photographer/videographer to
manage bookings, clients, wages/income, and AI-assisted admin work (drafting
replies, payment reminders, monthly summaries). This is not a SaaS product —
there is no signup, no multi-tenancy, no public marketing site. One person uses
this, privately, likely self-hosted or deployed to a single private URL.

Design reference: a dashboard mockup already exists (dark, warm-amber "darkroom"
theme, JetBrains Mono for numbers, Archivo Expanded for headers). Match that
visual language unless there's a strong reason to deviate — ask before deviating.

## 2. Tech stack (use this unless you have a concrete reason not to — explain if you deviate)

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite via Prisma (local-first, zero external infra). Schema
  should be portable to Postgres later without a rewrite.
- **Auth:** None required (single user), but gate the whole app behind a single
  shared password / passphrase middleware since it will likely be deployed to a
  public URL. Do not skip this — "personal use" does not mean "no protection."
- **AI:** Anthropic API (Claude) via server-side routes only. Never expose the
  API key to the client.
- **Deployment target:** Vercel or self-hosted Docker — keep both viable.

## 3. Core modules to build (in priority order)

1. **Bookings** — CRUD for shoots: client, event type, date/time, location,
   fee, status (Inquiry → Confirmed → Completed → Delivered), notes.
2. **Clients** — CRUD, derived fields (total jobs, total spent, last shoot)
   computed from bookings, not stored redundantly.
3. **Wages/Income** — transaction log (income + expenses), monthly
   gross/expenses/net rollups, simple category tagging.
4. **Calendar view** — month/week view of bookings, conflict highlighting
   (same-day double-bookings, insufficient turnaround buffer).
5. **AI Assist panel** (server-side, Claude API):
   - Draft a reply to a pasted client inquiry, using the user's rate card as
     context, and optionally pre-fill a draft booking from the parsed inquiry.
   - Draft a payment reminder message for an overdue/pending invoice.
   - Generate a plain-language monthly income summary from the transaction log.
   - Generate a shot-list checklist based on event type.
6. **Dashboard** — the landing view: this-month income, pending payments,
   upcoming shoots, in-editing count, upcoming bookings list, payment watch
   list. (This already exists as a static mockup — wire it to real data.)

## 4. Definition of done for each module

- Data persists via Prisma to SQLite; no mock/static data left in the final build.
- Every form validates input (client-side + server-side) and shows clear error
  states — no silent failures.
- Every list/table has an empty state with a clear next action, not a blank page.
- AI features degrade gracefully if the API key is missing or the call fails —
  show an inline error, never crash the page.
- Mobile-responsive down to ~375px width (he'll check this on his phone between
  shoots).
- No console errors, no TypeScript `any` without a comment explaining why.

## 5. What NOT to build

- No user accounts, roles, or permissions beyond the single shared passphrase.
- No multi-tenant data model — do not build this "as if" other photographers
  will one day use it. Keep it simple; refactor later if that ever becomes real.
- No payment processing / Stripe integration — this tracks payments, it doesn't
  collect them.
- No public client-facing pages (no client login, no public gallery links) —
  out of scope for this version.

## 6. First task

Before writing application code:
1. Scaffold the Next.js + TypeScript + Tailwind + Prisma project.
2. Define the Prisma schema for `Client`, `Booking`, `Transaction` per
   `SKILLS.md` §Data Model.
3. Set up the shared-passphrase middleware.
4. Rebuild the dashboard mockup's visual system as Tailwind design tokens
   (colors, type scale) before building any page, so every screen stays
   visually consistent.

Confirm the schema and design tokens with me before generating the full page set.
