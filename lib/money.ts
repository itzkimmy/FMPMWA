/**
 * Money utilities for StudioLedger.
 * Amounts stored as integers (sen / cents), displayed with Ringgit Malaysia (RM).
 * Never do arithmetic on display strings — always work in cents.
 */

export const CURRENCY_CODE = "MYR";
export const CURRENCY_SYMBOL = "RM";
export const CURRENCY_LOCALE = "en-MY";

/** Format cents (sen) to Malaysian Ringgit display string, e.g. 6840000 → "RM 68,400.00" */
export function formatMoney(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace(/\u00a0/g, " ");
}

/**
 * Format cents compactly (no decimals if whole number), e.g. 6840000 → "RM 68,400"
 * Use for dashboard stat cards where space is tight.
 */
export function formatMoneyCompact(cents: number): string {
  const amount = cents / 100;
  if (cents % 100 === 0) {
    return new Intl.NumberFormat(CURRENCY_LOCALE, {
      style: "currency",
      currency: CURRENCY_CODE,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace(/\u00a0/g, " ");
  }
  return formatMoney(cents);
}

/**
 * Parse a display string like "RM 68,400.00", "RM68,400", "₱68,400.00" or "68400" to cents.
 * Returns null if the string cannot be parsed to a valid number.
 */
export function parseMoneyCents(input: string): number | null {
  // Strip currency symbols (RM, ₱, $, etc.), commas, and whitespace
  const cleaned = input.replace(/(?:RM|rm|MYR|myr|₱|\$|[,\s])/g, "");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

/** Sum an array of cent / sen amounts */
export function sumCents(amounts: number[]): number {
  return amounts.reduce((acc, v) => acc + v, 0);
}
