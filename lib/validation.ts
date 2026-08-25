import { z } from "zod";
import { sanitizeString } from "./sanitize";

/**
 * Zod validation schemas with automatic sanitization.
 */

// ─── Client Schema ─────────────────────────────────────────────────────────

export const clientSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200)
    .transform((val) => sanitizeString(val)),
  contact: z
    .string()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((val) => sanitizeString(val)),
  source: z
    .string()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((val) => sanitizeString(val)),
  notes: z
    .string()
    .max(5000)
    .optional()
    .or(z.literal(""))
    .transform((val) => sanitizeString(val)),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// ─── Booking Schema ────────────────────────────────────────────────────────

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
  eventType: z
    .string()
    .min(1, "Event type is required")
    .max(100)
    .transform((val) => sanitizeString(val)),
  eventDate: z.string().min(1, "Event date is required"), // YYYY-MM-DD
  location: z
    .string()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((val) => sanitizeString(val)),
  feeInput: z
    .string()
    .min(1, "Fee is required")
    .refine((v) => {
      const n = parseFloat(v.replace(/(?:RM|rm|MYR|myr|₱|\$|[,\s])/g, ""));
      return !isNaN(n) && n >= 0 && n <= 10000000;
    }, "Enter a valid fee amount"),
  depositInput: z.string().optional().or(z.literal("")),
  status: z.enum(BOOKING_STATUS_VALUES).default("INQUIRY"),
  deliveryStatus: z.enum(DELIVERY_STATUS_VALUES).default("NOT_STARTED"),
  notes: z
    .string()
    .max(10000)
    .optional()
    .or(z.literal(""))
    .transform((val) => sanitizeString(val)),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// ─── Transaction Schema ────────────────────────────────────────────────────

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
      return !isNaN(n) && n > 0 && n <= 10000000;
    }, "Enter a valid amount greater than 0"),
  category: z
    .string()
    .max(100)
    .optional()
    .or(z.literal(""))
    .transform((val) => sanitizeString(val)),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500)
    .transform((val) => sanitizeString(val)),
  date: z.string().min(1, "Date is required"), // YYYY-MM-DD
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

// ─── Rate Card Schema ──────────────────────────────────────────────────────

export const rateCardSchema = z.object({
  photographyHalfDay: z.number().int().min(0).max(100000000).optional(),
  photographyFullDay: z.number().int().min(0).max(100000000).optional(),
  videographyHalfDay: z.number().int().min(0).max(100000000).optional(),
  videographyFullDay: z.number().int().min(0).max(100000000).optional(),
  portraitSession: z.number().int().min(0).max(100000000).optional(),
  additionalHour: z.number().int().min(0).max(100000000).optional(),
  rushFee: z.number().int().min(0).max(100000000).optional(),
  extraEdits: z.number().int().min(0).max(100000000).optional(),
  notes: z
    .string()
    .max(2000)
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
});

export type RateCard = z.infer<typeof rateCardSchema>;

// ─── Login Schema ──────────────────────────────────────────────────────────

export const loginSchema = z.object({
  passphrase: z.string().min(1, "Passphrase is required").max(100),
});

export type LoginFormData = z.infer<typeof loginSchema>;