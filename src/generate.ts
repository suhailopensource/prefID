import {
  DEFAULT_ALPHABET,
  DEFAULT_SEPARATOR,
  DEFAULT_SIZE,
  MAX_SIZE,
} from "./constants.js";
import { randomString } from "./internal/random.js";
import type { IdGenerator, IdOptions, PrefixedId } from "./types.js";

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

export function createId(defaults: IdOptions = {}): IdGenerator {
  const size = defaults.size ?? DEFAULT_SIZE;
  const separator = defaults.separator ?? DEFAULT_SEPARATOR;
  const alphabet = defaults.alphabet ?? DEFAULT_ALPHABET;

  if (!Number.isInteger(size) || size < 1 || size > MAX_SIZE) {
    throw new RangeError(
      `prefid: \`size\` must be an integer between 1 and ${MAX_SIZE}.`,
    );
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

export const id: IdGenerator = createId();
