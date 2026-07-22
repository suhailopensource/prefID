import {
  DEFAULT_ALPHABET,
  DEFAULT_SEPARATOR,
  DEFAULT_SORTABLE_RANDOM_SIZE,
  MAX_SIZE,
  SORTABLE_TIME_MAX,
} from "../constants/index.js";
import { assertValidPrefix } from "../internal/prefix.js";
import { randomIndices } from "../internal/random.js";
import type { IdGenerator, PrefixedId } from "../types/index.js";

export interface SortableIdOptions {
  separator?: string;
  alphabet?: string;
  randomSize?: number;
  timestampSize?: number;
  monotonic?: boolean;
  now?: () => number;
}

export interface GetTimestampOptions {
  separator?: string;
  alphabet?: string;
  timestampSize?: number;
}

function defaultTimestampSize(radix: number): number {
  let digits = 1;
  let capacity = radix;
  while (capacity <= SORTABLE_TIME_MAX) {
    capacity *= radix;
    digits++;
  }
  return digits;
}

function assertSortableAlphabet(alphabet: string): void {
  for (let i = 1; i < alphabet.length; i++) {
    if (alphabet.charCodeAt(i) <= alphabet.charCodeAt(i - 1)) {
      throw new RangeError(
        "prefid: a sortable `alphabet` must have characters in strictly " +
          "ascending code-point order (no duplicates), otherwise a " +
          "lexicographic sort would not match chronological order.",
      );
    }
  }
}

function encodeTime(time: number, alphabet: string, width: number): string {
  const radix = alphabet.length;
  const chars = new Array<string>(width);
  let value = time;
  for (let i = width - 1; i >= 0; i--) {
    chars[i] = alphabet[value % radix];
    value = Math.floor(value / radix);
  }
  if (value > 0) {
    throw new RangeError(
      `prefid: timestamp ${time} does not fit in ${width} "${alphabet[0]}".."${
        alphabet[radix - 1]
      }" characters.`,
    );
  }
  return chars.join("");
}

function decodeTime(
  str: string,
  alphabet: string,
  width: number,
): number | undefined {
  const radix = alphabet.length;
  let value = 0;
  for (let i = 0; i < width; i++) {
    const digit = alphabet.indexOf(str[i]);
    if (digit < 0) return undefined;
    value = value * radix + digit;
  }
  return value;
}

function incrementIndices(indices: number[], radix: number): number[] | null {
  const out = indices.slice();
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i] < radix - 1) {
      out[i]++;
      return out;
    }
    out[i] = 0;
  }
  return null;
}

function assertSize(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 1 || value > MAX_SIZE) {
    throw new RangeError(
      `prefid: \`${name}\` must be an integer between 1 and ${MAX_SIZE}.`,
    );
  }
}

export function createSortableId(options: SortableIdOptions = {}): IdGenerator {
  const separator = options.separator ?? DEFAULT_SEPARATOR;
  const alphabet = options.alphabet ?? DEFAULT_ALPHABET;
  const monotonic = options.monotonic ?? true;
  const clock = options.now ?? Date.now;
  const randomSize = options.randomSize ?? DEFAULT_SORTABLE_RANDOM_SIZE;

  if (typeof alphabet !== "string" || alphabet.length < 2) {
    throw new RangeError(
      "prefid: `alphabet` must contain at least 2 characters.",
    );
  }
  if (typeof separator !== "string" || separator.length === 0) {
    throw new TypeError("prefid: `separator` must be a non-empty string.");
  }
  assertSortableAlphabet(alphabet);

  const radix = alphabet.length;
  const timestampSize = options.timestampSize ?? defaultTimestampSize(radix);
  assertSize(randomSize, "randomSize");
  assertSize(timestampSize, "timestampSize");
  if (typeof clock !== "function") {
    throw new TypeError("prefid: `now` must be a function returning a number.");
  }

  let lastTime = -1;
  let lastRandom: number[] = [];

  return function sortableId<P extends string>(prefix: P): PrefixedId<P> {
    assertValidPrefix(prefix, separator);

    const reading = clock();
    if (typeof reading !== "number" || !Number.isFinite(reading)) {
      throw new TypeError("prefid: `now` must return a finite number.");
    }
    let time = Math.floor(reading);
    if (time < 0) {
      throw new RangeError("prefid: `now` must return a non-negative number.");
    }

    if (monotonic && time <= lastTime) {
      time = lastTime;
      const next = incrementIndices(lastRandom, radix);
      if (next) {
        lastRandom = next;
      } else {
        time = lastTime + 1;
        lastRandom = randomIndices(radix, randomSize);
      }
      lastTime = time;
    } else {
      lastTime = time;
      lastRandom = randomIndices(radix, randomSize);
    }

    let body = encodeTime(time, alphabet, timestampSize);
    for (let i = 0; i < randomSize; i++) body += alphabet[lastRandom[i]];

    return `${prefix}${separator}${body}` as PrefixedId<P>;
  };
}

export const sortableId: IdGenerator = createSortableId();

export function getTimestamp(
  value: string,
  options: GetTimestampOptions = {},
): number | undefined {
  if (typeof value !== "string") return undefined;

  const separator = options.separator ?? DEFAULT_SEPARATOR;
  const alphabet = options.alphabet ?? DEFAULT_ALPHABET;
  if (alphabet.length < 2) return undefined;
  const timestampSize =
    options.timestampSize ?? defaultTimestampSize(alphabet.length);

  const index = value.indexOf(separator);
  if (index <= 0) return undefined;

  const body = value.slice(index + separator.length);
  if (body.length < timestampSize) return undefined;

  return decodeTime(body.slice(0, timestampSize), alphabet, timestampSize);
}
