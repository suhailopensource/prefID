import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  randomString,
  secureRandomBytes,
  setBytesProvider,
  universalProvider,
} from "../src/internal/random.js";

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

afterEach(() => {
  setBytesProvider(universalProvider);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("secureRandomBytes()", () => {
  it("returns the requested number of bytes", () => {
    expect(secureRandomBytes(16).length).toBe(16);
  });

  it("returns different bytes on each call", () => {
    expect(toHex(secureRandomBytes(16))).not.toBe(toHex(secureRandomBytes(16)));
  });
});

describe("randomString()", () => {
  it("produces the requested length", () => {
    expect(randomString("abc", 10).length).toBe(10);
  });

  it("only uses characters from the alphabet", () => {
    expect(randomString("xy", 50)).toMatch(/^[xy]+$/);
  });

  it("has a roughly uniform character distribution (no modulo bias)", () => {
    const counts = new Array(10).fill(0);
    const runs = 50_000;
    for (let i = 0; i < runs; i++) {
      counts[Number(randomString("0123456789", 1))]++;
    }
    const expected = runs / 10;
    for (const count of counts) {
      expect(Math.abs(count - expected)).toBeLessThan(expected * 0.15);
    }
  });
});

describe("bytes provider indirection", () => {
  it("prefers globalThis.crypto.getRandomValues when it is present", () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => bytes);
    vi.stubGlobal("crypto", { getRandomValues });

    universalProvider(8);
    expect(getRandomValues).toHaveBeenCalledOnce();
    expect(getRandomValues.mock.calls[0][0]).toHaveLength(8);
  });

  it("routes randomString through the installed provider", () => {
    setBytesProvider((length) => new Uint8Array(length).fill(0));
    expect(randomString("abcd", 6)).toBe("aaaaaa");
  });

  it("setBytesProvider fully replaces the source", () => {
    setBytesProvider((length) => new Uint8Array(length).fill(7));
    expect(Array.from(secureRandomBytes(3))).toEqual([7, 7, 7]);
  });

  it("restores correct behaviour after resetting to the default", () => {
    setBytesProvider((length) => new Uint8Array(length).fill(1));
    setBytesProvider(universalProvider);
    expect(secureRandomBytes(16).length).toBe(16);
    expect(toHex(secureRandomBytes(16))).not.toBe(toHex(secureRandomBytes(16)));
  });
});

describe("node:crypto-backed provider (the Node 14.18 / 18 ESM path)", () => {
  const require = createRequire(import.meta.url);
  const { randomFillSync } = require("node:crypto") as {
    randomFillSync: (b: Uint8Array) => Uint8Array;
  };

  it("produces valid, non-repeating IDs", () => {
    setBytesProvider((length) => randomFillSync(new Uint8Array(length)));

    expect(secureRandomBytes(16).length).toBe(16);
    expect(randomString("0123456789abcdef", 12)).toMatch(/^[0-9a-f]{12}$/);

    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++)
      ids.add(randomString("0123456789abcdef", 16));
    expect(ids.size).toBe(1000);
  });
});
