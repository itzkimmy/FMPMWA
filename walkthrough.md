# FlowMotion UI Refinement Walkthrough — Sleek Dark Mode with High-Contrast Typography

## 1. Overview
The UI for **FlowMotion** has been fully updated to a refined, sleek dark theme with **bright, high-contrast typography**, addressing the issue where previous iterations were either unreadable ("too dark") or excessively bright.

---

## 2. Design System & Contrast Architecture

| Element | Color / Token | Description |
| :--- | :--- | :--- |
| **Canvas Background** | `#0B0F17` / `#0F172A` | Deep obsidian & midnight slate base |
| **Surface Cards & Panels** | `#131C2E` / `rgba(15, 23, 42, 0.85)` | Elevated dark panels with crisp borders (`#334155` / `rgba(255, 255, 255, 0.08)`) |
| **Primary Headings** | `#F8FAFC` / `#FFFFFF` | Crisp, ultra-bright white typography for optimal legibility |
| **Secondary Labels & Meta** | `#94A3B8` / `#CBD5E1` | Bright slate text (no low-contrast dark gray text) |
| **Primary Actions (CTA)** | `#F59E0B` (Amber 500) | High-contrast amber buttons with bold `#0B0F17` text and glowing hover states |
| **Financial Accents** | Emerald `#34D399`, Rose `#FB7185` | Luminous accents for income and expenses |

---

## 3. Updated Components & Pages

1. **Root & Theme Tokens**:
   - `tailwind.config.ts` & `app/globals.css`: Dark mode variables, bright text hierarchy, glassmorphism borders, and customized dark input fields.
   - `app/layout.tsx`: Dark mode root wrapper.

2. **Navigation & Shell**:
   - `components/layout/Sidebar.tsx`: Deep slate sidebar with bright white active items, amber studio logo icon, and glowing active pills.
   - `components/layout/TopBar.tsx`: Frosted dark topbar with high-contrast text and real-time operational status dot.

3. **Dashboard & Analytics**:
   - `app/(app)/page.tsx`: Stat cards with bright white figures, vibrant accent icons, upcoming shoots list, and payment watch feed.
   - `components/charts/MonthlyWagesChart.tsx`: High-contrast monthly bar graph with emerald (income), rose (expenses), and amber (net) bars plus an interactive hover breakdown tooltip.
   - `components/dashboard/QuickActionBar.tsx`: Glass-card action tiles with glowing accent icons.
   - `components/dashboard/PaymentWatchClient.tsx`: Clean dark list with bright client names and one-click copy reminder buttons.

4. **Ledger & Invoices (`/wages`)**:
   - High-contrast summary cards (Gross Income, Expenses, Net Profit, Margin).
   - Transaction table with bright text and colored income/expense tags.
   - Interactive transaction modal and month switcher.

5. **Bookings & Calendar (`/bookings`, `/calendar`)**:
   - Bookings table with search, sorting, and live status count pills.
   - Calendar month view with highlighted today badge and conflict alerts.
   - Booking detail, creation, and edit forms with crisp dark inputs.

6. **Clients & Settings (`/clients`, `/settings`, `/login`)**:
   - Client roster with revenue tracking and contact copy buttons.
   - Studio settings for currency (RM / MYR), default deposit %, and payment terms.
   - Sleek authentication card.

---

## 4. Verification & Testing

- **Unit Tests**: `npm test` — **21/21 passing** across conflict detection, date/currency utilities, payment watch, and Zod schemas.
- **Production Build**: `npm run build` — **Compiled 16/16 routes successfully** with 0 errors.
- **E2E HTTP Verification**: `node scripts/test-e2e.mjs` — **Passed all route and auth checks**.