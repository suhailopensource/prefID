import { MAX_RANDOM_BYTES } from "../constants";

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
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError(
      "prefid: random byte length must be a non-negative integer.",
    );
  }

  if (length === 0) return new Uint8Array(0);

  if (length <= MAX_RANDOM_BYTES) {
    return bytesProvider(length);
  }

  const result = new Uint8Array(length);

  for (let offset = 0; offset < length; offset += MAX_RANDOM_BYTES) {
    const chunkSize = Math.min(MAX_RANDOM_BYTES, length - offset);
    result.set(bytesProvider(chunkSize), offset);
  }

  return result;
}


export function randomIndices(radix: number, size: number): number[] {
  const mask = (2 << Math.floor(Math.log2(radix - 1))) - 1;
  const step = Math.max(
    1,
    Math.ceil((1.6 * mask * size) / radix),
  );

  const out: number[] = [];

  while (out.length < size) {
    const requestSize = Math.min(step, MAX_RANDOM_BYTES);
    const bytes = secureRandomBytes(requestSize);

    for (let i = 0; i < bytes.length && out.length < size; i++) {
      const index = bytes[i] & mask;

      if (index < radix) {
        out.push(index);
      }
    }
  }

  return out;
}


export function randomString(alphabet: string, size: number): string {
  const indices = randomIndices(alphabet.length, size);
  let result = "";
  for (let i = 0; i < size; i++) result += alphabet[indices[i]];
  return result;
}
