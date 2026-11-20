import { describe, expect, it } from "vitest";
import { assertAlphabet } from "../src/internal/alphabet.js";

describe("assertAlphabet()", () => {
  it("accepts valid alphabets between 2 and 256 unique BMP characters", () => {
    expect(() => assertAlphabet("ab")).not.toThrow();
    expect(() => assertAlphabet("0123456789abcdef")).not.toThrow();
    expect(() => assertAlphabet("абвгдежзийклмноп")).not.toThrow();
    expect(() => assertAlphabet("αβγδεζηθικλμνξοπ")).not.toThrow();

    const maxAlphabet = Array.from({ length: 256 }, (_, i) =>
      String.fromCharCode(i < 128 ? i + 33 : i + 200),
    ).join("");
    expect(maxAlphabet.length).toBe(256);
    expect(() => assertAlphabet(maxAlphabet)).not.toThrow();
  });

  it("rejects non-strings or alphabets with fewer than 2 characters", () => {
    expect(() => assertAlphabet(undefined)).toThrow(RangeError);
    expect(() => assertAlphabet(null)).toThrow(RangeError);
    expect(() => assertAlphabet(123)).toThrow(RangeError);
    expect(() => assertAlphabet("")).toThrow(RangeError);
    expect(() => assertAlphabet("a")).toThrow(RangeError);
  });

  it("rejects alphabets longer than 256 characters", () => {
    const longAlphabet = Array.from({ length: 257 }, (_, i) =>
      String.fromCharCode(0x0400 + i),
    ).join("");
    expect(longAlphabet.length).toBe(257);
    expect(() => assertAlphabet(longAlphabet)).toThrow(RangeError);
  });

  it("rejects alphabets with surrogate code units (emoji / characters outside BMP)", () => {
    expect(() => assertAlphabet("😀😁🙂🙃")).toThrow(RangeError);
    expect(() => assertAlphabet("ab\uD800c")).toThrow(RangeError);
    expect(() => assertAlphabet("ab\uDFFFc")).toThrow(RangeError);
    expect(() => assertAlphabet("abc🎉")).toThrow(RangeError);
  });

  it("rejects alphabets with duplicate characters", () => {
    expect(() => assertAlphabet("aa")).toThrow(RangeError);
    expect(() => assertAlphabet("aab")).toThrow(RangeError);
    expect(() => assertAlphabet("aba")).toThrow(RangeError);
    expect(() => assertAlphabet("01234567890")).toThrow(RangeError);
  });
});
