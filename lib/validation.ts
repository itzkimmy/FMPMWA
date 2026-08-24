import { z } from "zod";

/**
 * Zod validation schemas — shared between client and server.
 * Per AGENTS.md: no duplicated validation logic.
 */

// ─── Client ────────────────────────────────────────────────────────────────

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  contact: z.string().max(500).optional().or(z.literal("")),
  source: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// ─── Booking ───────────────────────────────────────────────────────────────

export const BOOKING_STATUS_VALUES = [
  "INQUIRY",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const DELIVERY_STATUS_VALUES = [
  "NOT_STARTED",
  "EDITING",
  "READY",
  "DELIVERED",
] as const;

export const EVENT_TYPES = [
  "Wedding",
  "Debut",
  "Portrait",
  "Product",
  "Event",
  "Corporate",
  "Maternity",
  "Newborn",
  "Family",
  "Other",
] as const;

export const bookingSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  eventType: z.string().min(1, "Event type is required").max(100),
  eventDate: z.string().min(1, "Event date is required"), // YYYY-MM-DD from form input
  location: z.string().max(500).optional().or(z.literal("")),
  // feeCents: accept as string from form, parse to int
  feeInput: z
    .string()
    .min(1, "Fee is required")
    .refine((v) => {
      const n = parseFloat(v.replace(/(?:RM|rm|MYR|myr|₱|\$|[,\s])/g, ""));
      return !isNaN(n) && n >= 0;
    }, "Enter a valid fee amount"),
  depositInput: z.string().optional().or(z.literal("")),
  status: z.enum(BOOKING_STATUS_VALUES).default("INQUIRY"),
  deliveryStatus: z.enum(DELIVERY_STATUS_VALUES).default("NOT_STARTED"),
  notes: z.string().max(10000).optional().or(z.literal("")),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// ─── Transaction ───────────────────────────────────────────────────────────

export const TRANSACTION_CATEGORIES = [
  "Booking payment",
  "Deposit received",
  "Gear",
  "Software",
  "Travel",
  "Assistant",
  "Editing",
  "Marketing",
  "Insurance",
  "Other expense",
  "Other income",
] as const;

export const transactionSchema = z.object({
  bookingId: z.string().optional().or(z.literal("")),
  type: z.enum(["INCOME", "EXPENSE"]),
  amountInput: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => {
      const n = parseFloat(v.replace(/(?:RM|rm|MYR|myr|₱|\$|[,\s])/g, ""));
      return !isNaN(n) && n > 0;
    }, "Enter a valid amount greater than 0"),
  category: z.string().max(100).optional().or(z.literal("")),
  description: z.string().min(1, "Description is required").max(500),
  date: z.string().min(1, "Date is required"), // YYYY-MM-DD
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

// ─── Settings / Rate Card ──────────────────────────────────────────────────

export const rateCardSchema = z.object({
  photographyHalfDay: z.number().int().min(0).optional(), // cents
  photographyFullDay: z.number().int().min(0).optional(),
  videographyHalfDay: z.number().int().min(0).optional(),
  videographyFullDay: z.number().int().min(0).optional(),
  portraitSession: z.number().int().min(0).optional(),
  additionalHour: z.number().int().min(0).optional(),
  rushFee: z.number().int().min(0).optional(),
  extraEdits: z.number().int().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

export type RateCard = z.infer<typeof rateCardSchema>;

// ─── Auth ──────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  passphrase: z.string().min(1, "Passphrase is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
