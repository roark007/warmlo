/**
 * Convert a furnace error code to a URL slug.
 * "E4" → "e4", "33" → "33", "Lc" → "lc"
 */
export function codeToSlug(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) {
    throw new Error("Code cannot be empty");
  }
  if (/\s/.test(trimmed)) {
    throw new Error("Code cannot contain spaces");
  }
  return trimmed.toLowerCase();
}
