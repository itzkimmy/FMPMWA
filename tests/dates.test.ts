import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatDate,
  formatMonthYear,
  manilaDateToUtc,
  toManilaDateString,
  getMonthRange,
} from "../lib/dates";

describe("Date Utilities", () => {
  it("formats date in Asia/Manila timezone", () => {
    // 2026-08-15T00:00:00Z is 8:00 AM Aug 15 in Manila
    const utcDate = new Date("2026-08-15T00:00:00Z");
    assert.equal(formatDate(utcDate), "Aug 15, 2026");
  });

  it("converts between Manila date string and UTC date correctly", () => {
    const manilaStr = "2026-10-25";
    const utcDate = manilaDateToUtc(manilaStr);
    assert.equal(utcDate.toISOString(), "2026-10-24T16:00:00.000Z");
    assert.equal(toManilaDateString(utcDate), "2026-10-25");
  });

  it("formats month and year in Manila timezone", () => {
    const date = new Date("2026-12-01T00:00:00Z");
    assert.equal(formatMonthYear(date), "December 2026");
  });

  it("calculates correct month range for queries", () => {
    const { start, end } = getMonthRange(2026, 8);
    // Start should be July 31 16:00 UTC (Midnight Aug 1 Manila)
    assert.equal(start.toISOString(), "2026-07-31T16:00:00.000Z");
    // End should be Aug 31 15:59:59 UTC (23:59:59 Aug 31 Manila)
    assert.equal(end.toISOString(), "2026-08-31T15:59:59.000Z");
  });
});
