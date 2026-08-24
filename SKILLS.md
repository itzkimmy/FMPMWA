# SKILLS.md

Domain and feature reference for StudioLedger. Read the relevant section
before implementing that feature — this is where the "how" for each module
lives, so the agent isn't guessing at business logic.

---

## Data Model

```prisma
model Client {
  id           String   @id @default(cuid())
  name         String
  contact      String?
  source       String?  // "Instagram", "Referral", "Repeat client", etc.
  notes        String?
  createdAt    DateTime @default(now())
  bookings     Booking[]
}

model Booking {
  id             String   @id @default(cuid())
  clientId       String
  client         Client   @relation(fields: [clientId], references: [id])
  eventType      String   // "Wedding", "Portrait", "Product", "Debut", etc.
  eventDate      DateTime
  location       String?
  feeCents       Int      // total agreed fee, in centavos — never a float
  depositCents   Int      @default(0)
  status         BookingStatus @default(INQUIRY)
  deliveryStatus DeliveryStatus @default(NOT_STARTED)
  notes          String?
  createdAt      DateTime @default(now())
  transactions   Transaction[]
}

enum BookingStatus {
  INQUIRY
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum DeliveryStatus {
  NOT_STARTED
  EDITING
  READY
  DELIVERED
}

model Transaction {
  id          String   @id @default(cuid())
  bookingId   String?
  booking     Booking? @relation(fields: [bookingId], references: [id])
  type        TransactionType // INCOME | EXPENSE
  amountCents Int
  category    String?  // "Gear", "Travel", "Software", "Booking payment"
  description String
  date        DateTime @default(now())
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

Rules:
- A booking's "amount paid so far" is derived by summing its linked income
  transactions — do not store a separate `amountPaid` field that can drift
  out of sync.
- Net wages = sum(INCOME transactions) − sum(EXPENSE transactions) for the
  period. Compute at query time; don't cache without a clear invalidation plan.

---

## Booking Conflict Detection

Flag (don't block) when:
- Two `CONFIRMED` bookings share the same calendar date.
- A booking's `eventDate` is within 24 hours of another `CONFIRMED` booking
  that hasn't reached `DELIVERED` status yet and is a full-day event type
  (wedding, debut) — this signals an editing-time squeeze, not just a
  same-day clash.

Surface conflicts as a dashboard warning, not a hard validation error — the
user may genuinely want to double-book (e.g. a second shooter) and should be
able to override.

---

## Payment Watch Logic

A booking appears in "Payment Watch" when:
- `status = CONFIRMED` and total linked INCOME transactions < `feeCents`, AND
- `eventDate` is in the past, OR `eventDate` is within 7 days and deposit is
  unpaid.

Sort by most overdue first (oldest `eventDate` with outstanding balance).

---

## AI Assist Features (Anthropic API)

All calls go through `/app/api/ai/*` route handlers. Never call the Anthropic
API from a client component.

### 1. Draft reply to inquiry
- Input: pasted inquiry text + user's saved rate card (from a simple settings
  table or config file).
- Output: JSON with `{ replyDraft: string, parsedBooking: { eventType,
  suggestedDate, location, budgetHint } | null }` — use a structured output
  prompt (instruct the model to return JSON only, then parse defensively).
- The parsed booking pre-fills a new booking form; it never auto-saves without
  the user reviewing it.

### 2. Payment reminder draft
- Input: booking record (client name, amount due, event date, days overdue).
- Output: plain message text in the user's voice — keep tone configurable
  (default: polite, brief, no guilt-tripping language).
- User always reviews/edits before sending; this tool never sends messages
  directly.

### 3. Monthly income summary
- Input: month's transactions + comparison to prior month.
- Output: 2–4 sentence plain-language summary (income, net, notable change).
  Do not fabricate trends beyond 2 months of comparison data if history is
  that short — say so instead of inventing a pattern.

### 4. Shot-list generator
- Input: event type (+ optional notes, e.g. "outdoor, includes reception").
- Output: a checklist array, editable before saving to the booking's notes.

### Failure handling (applies to all AI features)
- Missing API key → feature shows a disabled state with a clear message, rest
  of the app works normally.
- API error/timeout → inline retry option, no crash, no silent loss of
  anything the user typed.
- Always show AI output as a **draft** the user must confirm — never write AI
  output directly to the database without an explicit user action.

---

## Dashboard Calculations

- **This month's income:** sum of INCOME transactions where `date` is in the
  current calendar month.
- **Pending payments:** sum of (`feeCents` − paid) across bookings currently
  in Payment Watch.
- **Upcoming shoots:** count of bookings with `status = CONFIRMED` and
  `eventDate >= today`, within the current month.
- **In editing:** count of bookings with `deliveryStatus = EDITING`.

All dashboard numbers should be computed from the same query logic used
elsewhere (Payment Watch, booking lists) — don't reimplement the filters
twice with subtly different rules.

---

## Visual System (match the existing mockup)

- Background: near-black warm (`#14120F`), panels `#1C1914`, borders `#332D23`
- Accent: amber `#E8A33D` (primary), sage `#6FA88A` (positive/paid), red-clay
  `#C15B4A` (overdue/warning)
- Type: Archivo Expanded (headers), Inter (body/UI), JetBrains Mono (all
  numbers — money, dates, stats)
- Money and dates are always set in the mono face, even inside otherwise
  sans-serif text (e.g. a sentence like "You earned `₱68,400` this month")
- Status pills: pill-shaped, uppercase, small letter-spacing, colored by
  state (confirmed = sage, pending = amber, editing/neutral = muted grey)

Encode these as Tailwind theme tokens (`tailwind.config.ts`) before building
pages, so no component hardcodes a raw hex value.
