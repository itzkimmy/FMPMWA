import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatMoney,
  formatMoneyCompact,
  parseMoneyCents,
  sumCents,
} from "../lib/money";

describe("Money Utilities", () => {
  it("formats cents to standard Malaysian Ringgit display", () => {
    assert.equal(formatMoney(6840000), "RM 68,400.00");
    assert.equal(formatMoney(500050), "RM 5,000.50");
    assert.equal(formatMoney(0), "RM 0.00");
    assert.equal(formatMoney(99), "RM 0.99");
  });

  it("formats cents compactly without decimals if whole ringgit", () => {
    assert.equal(formatMoneyCompact(6840000), "RM 68,400");
    assert.equal(formatMoneyCompact(500050), "RM 5,000.50");
    assert.equal(formatMoneyCompact(0), "RM 0");
    assert.equal(formatMoneyCompact(150000), "RM 1,500");
  });

  it("parses strings to cents accurately", () => {
    assert.equal(parseMoneyCents("68400"), 6840000);
    assert.equal(parseMoneyCents("RM 68,400.00"), 6840000);
    assert.equal(parseMoneyCents("RM68,400.00"), 6840000);
    assert.equal(parseMoneyCents("5000.50"), 500050);
    assert.equal(parseMoneyCents("RM 1,250.75"), 125075);
    assert.equal(parseMoneyCents("0"), 0);
  });

  it("returns null for invalid money inputs", () => {
    assert.equal(parseMoneyCents("abc"), null);
    assert.equal(parseMoneyCents("-500"), null);
  });

  it("sums cent amounts without floating point errors", () => {
    const amounts = [100050, 200025, 300025];
    assert.equal(sumCents(amounts), 600100);
  });
});
