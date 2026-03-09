/** Matches combining diacritical marks (accents, tildes, umlauts) left after NFKD normalization */
const DIACRITICAL_MARKS = /[\u0300-\u036f]/g;

/** Matches anything that isn't a lowercase letter, digit, whitespace, underscore, or hyphen */
const NON_ALPHANUMERIC = /[^a-z0-9\s_-]/g;

/** Matches one or more whitespace characters or underscores */
const WHITESPACE_OR_UNDERSCORES = /[\s_]+/g;

/** Matches one or more consecutive hyphens */
const CONSECUTIVE_HYPHENS = /-+/g;

/** Matches hyphens at the start or end of the string */
const LEADING_OR_TRAILING_HYPHENS = /^-|-$/g;

/**
 * Strips diacritical marks (accents, tildes, umlauts) from a string.
 * Uses NFKD normalization to decompose characters into base + combining marks,
 * then removes the combining marks. E.g., "é" → "e", "ñ" → "n", "ü" → "u".
 */
function stripDiacritics(text: string): string {
  return text.normalize("NFKD").replace(DIACRITICAL_MARKS, "");
}

export function generateSlug(title: string): string {
  return stripDiacritics(title)
    .toLowerCase()
    .trim()
    .replace(NON_ALPHANUMERIC, "")
    .replace(WHITESPACE_OR_UNDERSCORES, "-")
    .replace(CONSECUTIVE_HYPHENS, "-")
    .replace(LEADING_OR_TRAILING_HYPHENS, "");
}
