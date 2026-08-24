import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clientSchema,
  bookingSchema,
  transactionSchema,
  rateCardSchema,
} from "../lib/validation";

describe("Zod Validation Schemas", () => {
  it("validates client data correctly", () => {
    const valid = clientSchema.safeParse({
      name: "Juan Dela Cruz",
      contact: "juan@example.com",
      source: "Instagram",
      notes: "Preferred style: editorial",
    });
    assert.equal(valid.success, true);

    const invalid = clientSchema.safeParse({
      name: "", // Empty name
    });
    assert.equal(invalid.success, false);
  });

  it("validates booking data with fee string parsing", () => {
    const valid = bookingSchema.safeParse({
      clientId: "client_123",
      eventType: "Wedding",
      eventDate: "2026-11-20",
      location: "Kuala Lumpur",
      feeInput: "RM 65,000.00",
      depositInput: "15000",
      status: "CONFIRMED",
      deliveryStatus: "NOT_STARTED",
      notes: "",
    });
    assert.equal(valid.success, true);

    const invalidFee = bookingSchema.safeParse({
      clientId: "client_123",
      eventType: "Wedding",
      eventDate: "2026-11-20",
      feeInput: "not-a-number",
    });
    assert.equal(invalidFee.success, false);
  });

  it("validates transaction amounts", () => {
    const validIncome = transactionSchema.safeParse({
      type: "INCOME",
      amountInput: "25000",
      description: "Downpayment received",
      category: "Deposit received",
      date: "2026-08-15",
    });
    assert.equal(validIncome.success, true);

    const invalidZero = transactionSchema.safeParse({
      type: "INCOME",
      amountInput: "0",
      description: "Invalid",
      date: "2026-08-15",
    });
    assert.equal(invalidZero.success, false);
  });

  it("validates rate card integer cents", () => {
    const validRateCard = rateCardSchema.safeParse({
      photographyHalfDay: 2500000, // ₱25,000 in cents
      photographyFullDay: 4500000,
      portraitSession: 800000,
      notes: "Includes color grading",
    });
    assert.equal(validRateCard.success, true);
  });
});
