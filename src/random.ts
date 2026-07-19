/**
 * Internal cryptographically-secure randomness helpers.
 *
 * Not part of the public API — exported only so they can be unit-tested.
 */

/** Minimal shape of the Node `crypto` module we rely on for the fallback path. */
interface NodeCryptoLike {
  randomFillSync(buffer: Uint8Array): Uint8Array;
}

// `require` exists as a free variable in CommonJS runtimes only. `typeof` on an
// undeclared name is safe (returns "undefined") in ESM, so the fallback is inert
// there. Declared here so the reference type-checks without `@types/node`.
declare const require: ((id: string) => unknown) | undefined;

/**
 * Lazily loads Node's `crypto` module *only* when the Web Crypto global is
 * missing. Kept behind `require` so browser bundlers never try to resolve
 * `node:crypto`, and guarded so it is a no-op in ESM runtimes without `require`.
 */
function loadNodeCrypto(): NodeCryptoLike | undefined {
  try {
    return typeof require === "function"
      ? (require("node:crypto") as NodeCryptoLike)
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Fills a `Uint8Array` with cryptographically secure random bytes.
 * Works in every modern runtime (Node 18+, browsers, Deno, Bun, edge), and
 * falls back to Node's CSPRNG where the Web Crypto global is not exposed.
 */
export function secureRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);

  const webCrypto = globalThis.crypto;
  if (webCrypto && typeof webCrypto.getRandomValues === "function") {
    return webCrypto.getRandomValues(bytes);
  }

  const nodeCrypto = loadNodeCrypto();
  if (nodeCrypto) {
    return nodeCrypto.randomFillSync(bytes);
  }

  throw new Error(
    "prefid: no secure random source found. This environment exposes " +
      "neither `globalThis.crypto.getRandomValues` nor Node's `crypto` module.",
  );
}

/**
 * Generates a random string of `size` characters from `alphabet` using the
 * unbiased masking algorithm (the same approach nanoid uses). Rejection
 * sampling guarantees every character is equally likely — no modulo bias.
 */
export function randomString(alphabet: string, size: number): string {
  const length = alphabet.length;
  // Smallest bitmask (2^n - 1) that can represent an index into the alphabet.
  const mask = (2 << Math.floor(Math.log2(length - 1))) - 1;
  // Over-allocate bytes per batch so a second batch is rarely needed.
  const step = Math.ceil((1.6 * mask * size) / length);

  let result = "";
  // Loop until we have collected `size` in-range characters.
  for (;;) {
    const bytes = secureRandomBytes(step);
    for (let i = 0; i < step; i++) {
      // Mask the byte down to the alphabet's bit-width, then reject any
      // value that lands outside the alphabet to keep the distribution flat.
      const index = bytes[i] & mask;
      if (index < length) {
        result += alphabet[index];
        if (result.length === size) return result;
      }
    }
  }
}
