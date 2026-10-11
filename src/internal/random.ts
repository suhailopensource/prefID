type BytesProvider = (length: number) => Uint8Array;

interface NodeCryptoLike {
  randomFillSync(buffer: Uint8Array): Uint8Array;
}

declare const require: ((id: string) => unknown) | undefined;

function loadNodeCrypto(): NodeCryptoLike | undefined {
  try {
    return typeof require === "function"
      ? (require("node:crypto") as NodeCryptoLike)
      : undefined;
  } catch {
    return undefined;
  }
}

export function universalProvider(length: number): Uint8Array {
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
      "neither `globalThis.crypto.getRandomValues` nor Node's `crypto` module. " +
      "If you are on Node 18 ESM, import from the package's default entry so the " +
      "Node-specific build is selected.",
  );
}

let bytesProvider: BytesProvider = universalProvider;

export function setBytesProvider(provider: BytesProvider): void {
  bytesProvider = provider;
}

export function secureRandomBytes(length: number): Uint8Array {
  return bytesProvider(length);
}

export function randomIndices(radix: number, size: number): number[] {
  const mask = (2 << Math.floor(Math.log2(radix - 1))) - 1;
  const step = Math.ceil((1.6 * mask * size) / radix);

  const out: number[] = [];
  for (;;) {
    const bytes = secureRandomBytes(step);
    for (let i = 0; i < step; i++) {
      const index = bytes[i] & mask;
      if (index < radix) {
        out.push(index);
        if (out.length === size) return out;
      }
    }
  }
}

export function randomString(alphabet: string, size: number): string {
  const indices = randomIndices(alphabet.length, size);
  let result = "";
  for (let i = 0; i < size; i++) result += alphabet[indices[i]];
  return result;
}

const MAX_BYTES_PER_CALL = 65_536;

export function randomIndexBatch(
  radix: number,
  size: number,
  count: number,
): number[] {
  const total = size * count;
  const mask = (2 << Math.floor(Math.log2(radix - 1))) - 1;
  const out: number[] = [];

  while (out.length < total) {
    const missing = total - out.length;
    const step = Math.min(
      MAX_BYTES_PER_CALL,
      Math.max(1, Math.ceil((1.6 * mask * missing) / radix)),
    );
    const bytes = secureRandomBytes(step);
    for (let i = 0; i < step && out.length < total; i++) {
      const index = bytes[i] & mask;
      if (index < radix) out.push(index);
    }
  }
  return out;
}

export function randomStrings(
  alphabet: string,
  size: number,
  count: number,
): string[] {
  const indices = randomIndexBatch(alphabet.length, size, count);
  const out: string[] = new Array(count);
  let cursor = 0;
  for (let n = 0; n < count; n++) {
    let result = "";
    for (let i = 0; i < size; i++) result += alphabet[indices[cursor++]];
    out[n] = result;
  }
  return out;
}
