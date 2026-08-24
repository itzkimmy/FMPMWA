# AGENTS.md

Instructions for any AI agent (Antigravity or otherwise) working in this repo.
This file governs *how* the agent works, not *what* the product does — see
`PROMPT.md` for the brief and `SKILLS.md` for domain/feature details.

## Project context

Personal, single-user web app for a freelance photographer/videographer:
bookings, clients, wages, AI-assisted admin. No multi-tenancy. No public
signup. Optimize for one real person's daily use, not for hypothetical scale.

## Ground rules

1. **Ask before assuming on anything ambiguous that affects data shape or
   money.** Financial fields, status enums, and date/timezone handling are not
   places to guess — confirm or flag the assumption clearly in the PR
   description.
2. **Never commit secrets.** API keys (Anthropic, DB, passphrase hash) live in
   `.env.local`, which is gitignored. Add new required env vars to
   `.env.example` with a placeholder, never a real value.
3. **Server-side only for AI calls.** All Claude API calls happen in Next.js
   route handlers / server actions. The client never sees the API key.
4. **Small, reviewable commits.** One logical change per commit. Don't bundle
   schema changes with unrelated UI work.
5. **Match existing patterns before introducing new ones.** If a pattern for
   forms, data fetching, or error handling already exists in the codebase,
   follow it rather than introducing a second way of doing the same thing.

## Tech stack (do not change without discussion)

- Next.js App Router + TypeScript (strict mode on)
- Tailwind CSS — use design tokens defined in `tailwind.config.ts`, don't
  hardcode hex values in components
- Prisma + SQLite (dev) — schema must stay Postgres-portable
- Anthropic SDK for AI features

## Code standards

- **TypeScript:** strict mode, no unexplained `any`. Prefer explicit types on
  function boundaries (props, API responses, Prisma query results).
- **Components:** Server Components by default; add `"use client"` only when
  the component needs interactivity/state. Keep client components small and
  push data fetching up to server components where possible.
- **Forms:** validate with a schema library (e.g. Zod) shared between client
  and server so validation logic isn't duplicated or allowed to drift.
- **Errors:** every server action / API route returns a typed result
  (`{ ok: true, data }` or `{ ok: false, error }`), never throws raw to the
  client. UI shows the error message, not a generic "something went wrong"
  unless the underlying error is unsafe to surface.
- **Money:** store currency amounts as integers (centavos/cents), never
  floats. Format for display only at the presentation layer.
- **Dates:** store as UTC in the DB, convert to local (Asia/Manila, unless
  told otherwise) only for display. Never do date math on formatted strings.
- **Naming:** name things by what the user does with them (`markInvoicePaid`,
  not `updateStatus`), consistent with the interface's own copy.

## File structure conventions

```
/app                  → routes (App Router)
  /(dashboard)/...     → authenticated app screens
  /api/...             → route handlers (AI calls, webhooks if any)
/components            → shared UI components
/lib
  /db.ts               → Prisma client singleton
  /ai.ts               → Anthropic client + prompt builders
  /validation.ts       → Zod schemas
/prisma
  /schema.prisma
/styles / tailwind.config.ts
```

## Testing expectations

- Unit tests for: money math, date/timezone conversion, conflict-detection
  logic (double-booking flags), and any Zod schema with nontrivial rules.
- Don't write tests for trivial pass-through UI — prioritize logic that could
  silently produce wrong numbers or wrong dates, since this is a financial tool.

## Before opening a PR / marking a task done

- [ ] `npm run typecheck` and `npm run lint` pass
- [ ] No hardcoded mock data left in place of real Prisma queries
- [ ] New env vars documented in `.env.example`
- [ ] Responsive check at ~375px width
- [ ] Empty states and error states verified, not just the happy path
- [ ] If money or dates were touched: unit test added or updated

## What to escalate instead of guessing

- Any change to the `Client`, `Booking`, or `Transaction` schema shape
- Anything that would send data to a third party besides the Anthropic API
- Any request that implies adding user accounts, multi-tenancy, or public access

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
