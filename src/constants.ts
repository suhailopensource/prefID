/**
 * URL-safe, double-click-selectable base62 alphabet.
 * No `-` or `_`, so the whole id selects as a single token in browsers/terminals.
 */
export const DEFAULT_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Default number of random characters after the separator. */
export const DEFAULT_SIZE = 24;

/** Default separator between the prefix and the random part. */
export const DEFAULT_SEPARATOR = "_";
