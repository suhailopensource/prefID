import {
  DEFAULT_ALPHABET,
  DEFAULT_SIZE,
  MAX_SIZE,
} from "../constants/index.js";
import { assertAlphabet } from "../internal/alphabet.js";
import type { IdOptions } from "../types/index.js";

function resolve(options: IdOptions): { size: number; radix: number } {
  const size = options.size ?? DEFAULT_SIZE;
  const alphabet = options.alphabet ?? DEFAULT_ALPHABET;
  if (!Number.isInteger(size) || size < 1 || size > MAX_SIZE) {
    throw new RangeError(
      `prefid: \`size\` must be an integer between 1 and ${MAX_SIZE}.`,
    );
  }
  assertAlphabet(alphabet);
  return { size, radix: alphabet.length };
}

export function entropyBits(options: IdOptions = {}): number {
  const { size, radix } = resolve(options);
  return size * Math.log2(radix);
}

export function sizeForEntropy(
  bits: number,
  alphabet: string = DEFAULT_ALPHABET,
): number {
  if (typeof bits !== "number" || !Number.isFinite(bits) || bits <= 0) {
    throw new RangeError("prefid: `bits` must be a positive finite number.");
  }
  assertAlphabet(alphabet);
  const perChar = Math.log2(alphabet.length);
  const size = Math.floor(bits / perChar);
  return size * perChar < bits ? size + 1 : size;
}

export function collisionProbability(
  count: number,
  options: IdOptions = {},
): number {
  if (typeof count !== "number" || !Number.isFinite(count) || count < 0) {
    throw new RangeError(
      "prefid: `count` must be a non-negative finite number.",
    );
  }
  const { size, radix } = resolve(options);
  if (count < 2) return 0;
  const x = Math.exp(
    Math.log(count) + Math.log(count - 1) - Math.LN2 - size * Math.log(radix),
  );
  return -Math.expm1(-x);
}
