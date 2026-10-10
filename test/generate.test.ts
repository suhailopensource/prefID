import { describe, expect, it } from "vitest";
import { createId, id } from "../src/index.js";

describe("id()", () => {
  it("produces an id with the prefix and default separator", () => {
    expect(id("user").startsWith("user_")).toBe(true);
  });

  it("uses 24 random characters by default", () => {
    expect(id("user").length).toBe("user_".length + 24);
  });

  it("only uses the default base62 alphabet in the random part", () => {
    const random = id("user").slice("user_".length);
    expect(random).toMatch(/^[0-9A-Za-z]+$/);
  });

  it("generates unique ids across many calls", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i++) seen.add(id("user"));
    expect(seen.size).toBe(10_000);
  });

  it("throws on an empty prefix", () => {
    expect(() => id("")).toThrow(TypeError);
  });

  it("throws when the prefix contains the separator", () => {
    expect(() => id("us_er")).toThrow(TypeError);
  });
});

describe("createId()", () => {
  it("respects a custom size", () => {
    const short = createId({ size: 8 });
    expect(short("order").length).toBe("order_".length + 8);
  });

  it("respects a custom separator", () => {
    const withDot = createId({ separator: "." });
    expect(withDot("order").startsWith("order.")).toBe(true);
  });

  it("carries a custom separator through to the value type", () => {
    const gen = createId({ separator: "-" });
    const value = gen("user");
    const typed: `user-${string}` = value;
    expect(typed.startsWith("user-")).toBe(true);
  });

  it("does not type a custom-separator id as underscore-separated", () => {
    const value = createId({ separator: "-" })("user");
    // @ts-expect-error
    const wrong: `user_${string}` = value;
    expect(wrong.startsWith("user-")).toBe(true);
  });

  it("respects a custom alphabet", () => {
    const binary = createId({ alphabet: "01", size: 12 });
    const random = binary("bit").slice("bit_".length);
    expect(random).toMatch(/^[01]{12}$/);
  });

  it("rejects an invalid size", () => {
    expect(() => createId({ size: 0 })).toThrow(RangeError);
    expect(() => createId({ size: 1.5 })).toThrow(RangeError);
  });

  it("rejects a size above the maximum (DoS guard)", () => {
    expect(() => createId({ size: 4097 })).toThrow(RangeError);
    expect(() => createId({ size: 5_000_000 })).toThrow(RangeError);
    expect(() => createId({ size: 2 ** 53 })).toThrow(RangeError);
  });

  it("accepts the maximum size boundary", () => {
    const gen = createId({ size: 4096 });
    expect(gen("x").length).toBe("x_".length + 4096);
  });

  it("rejects an alphabet shorter than 2 characters", () => {
    expect(() => createId({ alphabet: "x" })).toThrow(RangeError);
  });

  it("rejects an empty separator", () => {
    expect(() => createId({ separator: "" })).toThrow(TypeError);
  });
});

describe("createId().many()", () => {
  it("generates the requested number of IDs", () => {
    const generator = createId();

    const ids = generator.many("user", 5);

    expect(ids).toHaveLength(5);
    expect(ids.every((value) => value.startsWith("user_"))).toBe(true);
  });

  it("generates distinct IDs", () => {
    const generator = createId();

    const ids = generator.many("user", 100);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("returns an empty array for a count of zero", () => {
    expect(createId().many("user", 0)).toEqual([]);
  });

  it("rejects invalid batch counts", () => {
    const generator = createId();

    expect(() => generator.many("user", -1)).toThrow(RangeError);
    expect(() => generator.many("user", 1.5)).toThrow(RangeError);
    expect(() => generator.many("user", 10_001)).toThrow(RangeError);
  });

  it("respects custom size and separator", () => {
    const generator = createId({ size: 4, separator: ":" });

    const ids = generator.many("user", 3);

    expect(ids).toHaveLength(3);

    for (const value of ids) {
      expect(value).toMatch(/^user:[A-Za-z0-9]{4}$/);
    }
  });
});
