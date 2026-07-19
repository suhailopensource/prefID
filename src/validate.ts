import { DEFAULT_SEPARATOR } from "./constants.js";
import type { PrefixedId } from "./types.js";

/**
 * Type guard: returns `true` when `value` is a string that begins with
 * `${prefix}${separator}`. Narrows the type to `PrefixedId<P>`.
 *
 * @example
 * if (isId(input, "user")) {
 *   // input is now typed as `user_${string}`
 * }
 */
export function isId<P extends string>(
  value: unknown,
  prefix: P,
  separator: string = DEFAULT_SEPARATOR,
): value is PrefixedId<P> {
  return typeof value === "string" && value.startsWith(`${prefix}${separator}`);
}

/**
 * Extracts the prefix from an id, or returns `undefined` when the separator
 * is not present (or is at the very start).
 *
 * @example
 * getPrefix("user_a1b2c3"); // => "user"
 */
export function getPrefix(
  value: string,
  separator: string = DEFAULT_SEPARATOR,
): string | undefined {
  const index = value.indexOf(separator);
  return index > 0 ? value.slice(0, index) : undefined;
}
