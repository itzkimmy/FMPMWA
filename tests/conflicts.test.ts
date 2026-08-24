import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectConflicts } from "../lib/conflicts";

describe("Booking Conflict Detection", () => {
  it("detects same-day confirmed bookings", () => {
    const bookings = [
      {
        id: "b1",
        eventType: "Portrait",
        eventDate: new Date("2026-08-15T02:00:00Z"), // 10:00 AM Manila Aug 15
        status: "CONFIRMED" as const,
        deliveryStatus: "NOT_STARTED" as const,
      },
      {
        id: "b2",
        eventType: "Corporate",
        eventDate: new Date("2026-08-15T08:00:00Z"), // 4:00 PM Manila Aug 15
        status: "CONFIRMED" as const,
        deliveryStatus: "NOT_STARTED" as const,
      },
    ];

    const conflicts = detectConflicts(bookings);
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].type, "SAME_DAY");
  });

  it("detects editing squeeze within 24 hours for undelivered full-day events", () => {
    const bookings = [
      {
        id: "b1",
        eventType: "Wedding",
        eventDate: new Date("2026-08-15T06:00:00Z"),
        status: "CONFIRMED" as const,
        deliveryStatus: "EDITING" as const,
      },
      {
        id: "b2",
        eventType: "Portrait",
        eventDate: new Date("2026-08-16T04:00:00Z"), // 22 hours later
        status: "CONFIRMED" as const,
        deliveryStatus: "NOT_STARTED" as const,
      },
    ];

    const conflicts = detectConflicts(bookings);
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].type, "EDITING_SQUEEZE");
  });

  it("does not flag conflict if the full-day event is already DELIVERED", () => {
    const bookings = [
      {
        id: "b1",
        eventType: "Wedding",
        eventDate: new Date("2026-08-15T06:00:00Z"),
        status: "CONFIRMED" as const,
        deliveryStatus: "DELIVERED" as const,
      },
      {
        id: "b2",
        eventType: "Portrait",
        eventDate: new Date("2026-08-16T04:00:00Z"),
        status: "CONFIRMED" as const,
        deliveryStatus: "NOT_STARTED" as const,
      },
    ];

    const conflicts = detectConflicts(bookings);
    assert.equal(conflicts.length, 0);
  });

  it("ignores unconfirmed or cancelled bookings", () => {
    const bookings = [
      {
        id: "b1",
        eventType: "Wedding",
        eventDate: new Date("2026-08-15T02:00:00Z"),
        status: "INQUIRY" as const,
        deliveryStatus: "NOT_STARTED" as const,
      },
      {
        id: "b2",
        eventType: "Wedding",
        eventDate: new Date("2026-08-15T08:00:00Z"),
        status: "CANCELLED" as const,
        deliveryStatus: "NOT_STARTED" as const,
      },
    ];

    const conflicts = detectConflicts(bookings);
    assert.equal(conflicts.length, 0);
  });
});
