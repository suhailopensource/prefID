import {
  DEFAULT_ALPHABET,
  DEFAULT_SEPARATOR,
  DEFAULT_SIZE,
  MAX_BATCH,
  MAX_SIZE,
} from "../constants/index.js";
import { assertValidCount, assertValidPrefix } from "../internal/prefix.js";
import { randomString, randomStrings } from "../internal/random.js";
import type {
  BatchIdGenerator,
  IdOptions,
  PrefixedId,
} from "../types/index.js";

export function createId<S extends string = "_">(
  defaults: IdOptions & { separator?: S } = {},
): BatchIdGenerator<S> {
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

  function id<P extends string>(prefix: P): PrefixedId<P, S> {
    assertValidPrefix(prefix, separator);
    return `${prefix}${separator}${randomString(alphabet, size)}` as PrefixedId<
      P,
      S
    >;
  }

  function many<P extends string>(
    prefix: P,
    count: number,
  ): PrefixedId<P, S>[] {
    assertValidPrefix(prefix, separator);
    assertValidCount(count, MAX_BATCH);
    const head = `${prefix}${separator}`;
    return randomStrings(alphabet, size, count).map(
      (body) => `${head}${body}` as PrefixedId<P, S>,
    );
  }

  return Object.assign(id, { many });
}

export const id: BatchIdGenerator = createId();
