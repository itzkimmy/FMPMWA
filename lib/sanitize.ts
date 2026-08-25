/**
 * Input sanitization helpers to guard against XSS and injection attacks.
 */

/**
 * Removes dangerous HTML tags and scripts, trims whitespace, and strips null bytes.
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return "";

  return input
    .replace(/\0/g, "") // Remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframes
    .replace(/javascript:/gi, "") // Strip inline javascript: pseudo-protocols
    .replace(/on\w+="[^"]*"/gi, "") // Strip event handlers
    .replace(/on\w+='[^']*'/gi, "")
    .trim();
}