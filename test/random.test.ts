import { describe, expect, it } from "vitest";
import { randomString, secureRandomBytes } from "../src/internal/random.js";

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

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
