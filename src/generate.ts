import {
  DEFAULT_ALPHABET,
  DEFAULT_SEPARATOR,
  DEFAULT_SIZE,
} from "./constants.js";
import { randomString } from "./random.js";
import type { IdGenerator, IdOptions, PrefixedId } from "./types.js";

/** Validates a prefix at call time and throws a helpful error if it is invalid. */
function assertValidPrefix(prefix: string, separator: string): void {
  if (typeof prefix !== "string" || prefix.length === 0) {
    throw new TypeError("prefid: prefix must be a non-empty string.");
  }
  if (prefix.includes(separator)) {
    throw new TypeError(
      `prefid: prefix "${prefix}" must not contain the separator "${separator}".`,
    );
  }
}

/**
 * Creates an id generator with fixed options. Use this to configure the size,
 * separator, or alphabet once and reuse everywhere.
 *
 * @example
 * const id = createId({ size: 16 });
 * id("user"); // => "user_a1b2c3d4e5f6g7h8"
 */
export function createId(defaults: IdOptions = {}): IdGenerator {
  const size = defaults.size ?? DEFAULT_SIZE;
  const separator = defaults.separator ?? DEFAULT_SEPARATOR;
  const alphabet = defaults.alphabet ?? DEFAULT_ALPHABET;

  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("prefid: `size` must be a positive integer.");
  }
  if (typeof alphabet !== "string" || alphabet.length < 2) {
    throw new RangeError(
      "prefid: `alphabet` must contain at least 2 characters.",
    );
  }
  if (typeof separator !== "string" || separator.length === 0) {
    throw new TypeError("prefid: `separator` must be a non-empty string.");
  }

  return function id<P extends string>(prefix: P): PrefixedId<P> {
    assertValidPrefix(prefix, separator);
    return `${prefix}${separator}${randomString(alphabet, size)}` as PrefixedId<P>;
  };
}

/**
 * Generates a prefixed id using the default options
 * (24 random base62 characters, `_` separator).
 *
 * @example
 * id("user"); // => "user_a8Kd0f2bQ1..."
 */
export const id: IdGenerator = createId();
