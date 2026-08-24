import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isOnPaymentWatch,
  getPaidCents,
  buildPaymentWatchList,
  type BookingWithTransactions,
} from "../lib/payment-watch";

describe("Payment Watch Logic", () => {
  const dummyClient = {
    id: "c1",
    name: "Maria Santos",
    contact: "09171234567",
    source: "Instagram",
    notes: null,
    createdAt: new Date(),
  };

  it("includes confirmed booking with past date and outstanding balance", () => {
    const booking: BookingWithTransactions = {
      id: "b1",
      clientId: "c1",
      client: dummyClient,
      eventType: "Wedding",
      eventDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      location: "Tagaytay",
      feeCents: 5000000, // ₱50,000
      depositCents: 1000000,
      status: "CONFIRMED",
      deliveryStatus: "EDITING",
      notes: null,
      createdAt: new Date(),
      transactions: [
        {
          id: "t1",
          bookingId: "b1",
          type: "INCOME",
          amountCents: 1000000, // ₱10,000 deposit paid
          category: "Deposit",
          description: "Deposit",
          date: new Date(),
        },
      ],
    };

    assert.equal(getPaidCents(booking), 1000000);
    assert.equal(isOnPaymentWatch(booking), true);
  });

  it("excludes fully paid bookings even if in the past", () => {
    const booking: BookingWithTransactions = {
      id: "b1",
      clientId: "c1",
      client: dummyClient,
      eventType: "Wedding",
      eventDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      location: null,
      feeCents: 5000000,
      depositCents: 1000000,
      status: "CONFIRMED",
      deliveryStatus: "DELIVERED",
      notes: null,
      createdAt: new Date(),
      transactions: [
        {
          id: "t1",
          bookingId: "b1",
          type: "INCOME",
          amountCents: 5000000,
          category: "Payment",
          description: "Full payment",
          date: new Date(),
        },
      ],
    };

    assert.equal(isOnPaymentWatch(booking), false);
  });

  it("includes upcoming shoot within 7 days when deposit is unpaid", () => {
    const booking: BookingWithTransactions = {
      id: "b2",
      clientId: "c1",
      client: dummyClient,
      eventType: "Debut",
      eventDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      location: "Makati",
      feeCents: 3000000,
      depositCents: 1000000,
      status: "CONFIRMED",
      deliveryStatus: "NOT_STARTED",
      notes: null,
      createdAt: new Date(),
      transactions: [], // 0 paid
    };

    assert.equal(isOnPaymentWatch(booking), true);
  });

  it("sorts payment watch list with most overdue first", () => {
    const b1: BookingWithTransactions = {
      id: "b1",
      clientId: "c1",
      client: dummyClient,
      eventType: "Wedding",
      eventDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      location: null,
      feeCents: 4000000,
      depositCents: 0,
      status: "CONFIRMED",
      deliveryStatus: "EDITING",
      notes: null,
      createdAt: new Date(),
      transactions: [],
    };

    const b2: BookingWithTransactions = {
      id: "b2",
      clientId: "c1",
      client: dummyClient,
      eventType: "Portrait",
      eventDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      location: null,
      feeCents: 1000000,
      depositCents: 0,
      status: "CONFIRMED",
      deliveryStatus: "EDITING",
      notes: null,
      createdAt: new Date(),
      transactions: [],
    };

    const list = buildPaymentWatchList([b1, b2]);
    assert.equal(list.length, 2);
    assert.equal(list[0].booking.id, "b2"); // Most overdue first
  });
});
