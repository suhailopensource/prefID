
import {
  DEFAULT_ALPHABET,
  DEFAULT_SEPARATOR,
  DEFAULT_SIZE,
  MAX_SIZE,
  MAX_BATCH_SIZE
} from "../constants/index.js";
import { assertValidPrefix } from "../internal/prefix.js";
import { randomString } from "../internal/random.js";
import type { BatchIdGenerator, IdGenerator, IdOptions, PrefixedId } from "../types/index.js";

export function createId<S extends string = "_">(
  defaults: IdOptions & { separator?: S; } = {},
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

  const id: BatchIdGenerator<S> = function <P extends string>(
    prefix: P,
  ): PrefixedId<P, S> {
    assertValidPrefix(prefix, separator);
    return `${prefix}${separator}${randomString(alphabet, size)}` as PrefixedId<
      P,
      S
    >;
  };

  id.many = function <P extends string>(
    prefix: P,
    count: number,
  ): PrefixedId<P, S>[] {
    if (
      !Number.isInteger(count) ||
      count < 0 ||
      count > MAX_BATCH_SIZE
    ) {
      throw new RangeError(
        `prefid: batch count must be an integer between 0 and ${MAX_BATCH_SIZE}.`,
      );
    }

    assertValidPrefix(prefix, separator);

    if (count === 0) return [];

    const characters = randomString(alphabet, size * count);
    const ids: PrefixedId<P, S>[] = [];

    for (let i = 0; i < count; i++) {
      const start = i * size;
      const body = characters.slice(start, start + size);

      ids.push(`${prefix}${separator}${body}` as PrefixedId<P, S>);
    }

    return ids;
  };

  return id;
}

export const id: IdGenerator = createId();
