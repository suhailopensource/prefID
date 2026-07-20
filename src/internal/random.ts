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

export function randomString(alphabet: string, size: number): string {
  const length = alphabet.length;
  const mask = (2 << Math.floor(Math.log2(length - 1))) - 1;
  const step = Math.ceil((1.6 * mask * size) / length);

  let result = "";
  for (;;) {
    const bytes = secureRandomBytes(step);
    for (let i = 0; i < step; i++) {
      const index = bytes[i] & mask;
      if (index < length) {
        result += alphabet[index];
        if (result.length === size) return result;
      }
    }
  }
}
