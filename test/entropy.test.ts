import { describe, expect, it } from "vitest";
import {
  collisionProbability,
  createId,
  entropyBits,
  sizeForEntropy,
} from "../src/index.js";

describe("entropyBits()", () => {
  it("matches the reference values", () => {
    expect(entropyBits()).toBeCloseTo(142.9, 2);
    expect(entropyBits({ size: 8 })).toBeCloseTo(47.63, 2);
  });

  it("honours a custom alphabet", () => {
    expect(entropyBits({ size: 10, alphabet: "01" })).toBe(10);
  });

  it("validates its input", () => {
    expect(() => entropyBits({ size: 0 })).toThrow(RangeError);
    expect(() => entropyBits({ size: 1.5 })).toThrow(RangeError);
    expect(() => entropyBits({ size: 4097 })).toThrow(RangeError);
    expect(() => entropyBits({ alphabet: "a" })).toThrow(RangeError);
    expect(() => entropyBits({ alphabet: "aa" })).toThrow(RangeError);
    expect(() => entropyBits({ alphabet: "😀😁" })).toThrow(RangeError);
    expect(() =>
      entropyBits({
        alphabet: Array.from({ length: 257 }, (_, i) =>
          String.fromCharCode(0x0400 + i),
        ).join(""),
      }),
    ).toThrow(RangeError);
  });
});

describe("sizeForEntropy()", () => {
  it("returns the smallest size reaching the target", () => {
    expect(sizeForEntropy(128)).toBe(22);
    expect(sizeForEntropy(8, "01")).toBe(8);
    expect(sizeForEntropy(9, "01")).toBe(9);
  });

  it("round-trips the entropy of an existing size", () => {
    for (let size = 1; size <= 64; size++) {
      expect(sizeForEntropy(entropyBits({ size }))).toBe(size);
    }
  });

  it("produces a size that createId accepts and that meets the target", () => {
    const size = sizeForEntropy(128);
    expect(entropyBits({ size })).toBeGreaterThanOrEqual(128);
    expect(createId({ size })("user").length).toBe("user_".length + size);
  });

  it("validates its input", () => {
    expect(() => sizeForEntropy(0)).toThrow(RangeError);
    expect(() => sizeForEntropy(Number.NaN)).toThrow(RangeError);
    expect(() => sizeForEntropy(64, "a")).toThrow(RangeError);
    expect(() => sizeForEntropy(64, "aa")).toThrow(RangeError);
    expect(() => sizeForEntropy(64, "😀😁")).toThrow(RangeError);
    expect(() =>
      sizeForEntropy(
        64,
        Array.from({ length: 257 }, (_, i) =>
          String.fromCharCode(0x0400 + i),
        ).join(""),
      ),
    ).toThrow(RangeError);
  });
});

describe("collisionProbability()", () => {
  it("matches the reference values", () => {
    expect(collisionProbability(1e9) / 4.804e-26).toBeCloseTo(1, 3);
    expect(collisionProbability(1e6, { size: 8 }) / 2.287e-3).toBeCloseTo(1, 2);
  });

  it("gives 1 / N for exactly two ids", () => {
    expect(collisionProbability(2) * 62 ** 24).toBeCloseTo(1, 10);
  });

  it("never rounds realistic inputs to zero", () => {
    expect(collisionProbability(1e9)).toBeGreaterThan(0);
  });

  it("returns 0 for fewer than two ids", () => {
    expect(collisionProbability(0)).toBe(0);
    expect(collisionProbability(1)).toBe(0);
  });

  it("approaches 1 for a tiny id space", () => {
    expect(collisionProbability(1000, { size: 1, alphabet: "ab" })).toBe(1);
  });

  it("validates its input", () => {
    expect(() => collisionProbability(-1)).toThrow(RangeError);
    expect(() => collisionProbability(Number.NaN)).toThrow(RangeError);
    expect(() => collisionProbability(10, { size: 0 })).toThrow(RangeError);
    expect(() => collisionProbability(10, { alphabet: "a" })).toThrow(
      RangeError,
    );
    expect(() => collisionProbability(10, { alphabet: "aa" })).toThrow(
      RangeError,
    );
    expect(() => collisionProbability(10, { alphabet: "😀😁" })).toThrow(
      RangeError,
    );
    expect(() =>
      collisionProbability(10, {
        alphabet: Array.from({ length: 257 }, (_, i) =>
          String.fromCharCode(0x0400 + i),
        ).join(""),
      }),
    ).toThrow(RangeError);
  });
});
