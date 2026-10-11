import { afterEach, describe, expect, it } from "vitest";
import { MAX_BATCH } from "../src/constants/index.js";
import {
  createId,
  createSortableId,
  id,
  sortableId,
  type IdGenerator,
  type PrefixedId,
} from "../src/index.js";
import { setBytesProvider, universalProvider } from "../src/internal/random.js";

afterEach(() => setBytesProvider(universalProvider));

describe("id.many()", () => {
  it("returns distinct, prefixed ids of the right length", () => {
    const ids = id.many("user", 1000);
    expect(ids).toHaveLength(1000);
    expect(new Set(ids).size).toBe(1000);
    for (const value of ids) {
      expect(value.startsWith("user_")).toBe(true);
      expect(value.length).toBe("user_".length + 24);
    }
  });

  it("is typed as PrefixedId<P, S>[]", () => {
    const ids: `user_${string}`[] = id.many("user", 2);
    const custom: `evt-${string}`[] = createId({ separator: "-" }).many(
      "evt",
      2,
    );
    expect(ids).toHaveLength(2);
    expect(custom[0].startsWith("evt-")).toBe(true);
  });

  it("honours size, alphabet and separator", () => {
    const gen = createId({ size: 5, alphabet: "ab", separator: ":" });
    for (const value of gen.many("k", 50)) expect(value).toMatch(/^k:[ab]{5}$/);
  });

  it("returns an empty array for a count of 0", () => {
    expect(id.many("user", 0)).toEqual([]);
  });

  it("accepts the maximum count", () => {
    expect(id.many("user", MAX_BATCH)).toHaveLength(MAX_BATCH);
  });

  it("rejects an invalid count", () => {
    for (const bad of [-1, 1.5, Number.NaN, MAX_BATCH + 1]) {
      expect(() => id.many("user", bad)).toThrow(RangeError);
    }
  });

  it("validates the prefix like the single generator", () => {
    expect(() => id.many("", 1)).toThrow(TypeError);
    expect(() => id.many("us_er", 1)).toThrow(TypeError);
  });

  it("never asks the random source for more than 65,536 bytes at once", () => {
    const sizes: number[] = [];
    setBytesProvider((length) => {
      sizes.push(length);
      return universalProvider(length);
    });
    expect(id.many("user", MAX_BATCH)).toHaveLength(MAX_BATCH);
    expect(sizes.length).toBeGreaterThan(1);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(65_536);
  });

  it("draws far fewer random calls than one per id", () => {
    let calls = 0;
    setBytesProvider((length) => {
      calls++;
      return universalProvider(length);
    });
    id.many("user", 1000);
    expect(calls).toBeLessThan(1000 / 10);
  });
});

describe("sortableId.many()", () => {
  it("returns strictly increasing ids", () => {
    const ids = sortableId.many("evt", 2000);
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
    expect(new Set(ids).size).toBe(2000);
  });

  it("stays strictly increasing across a monotonic overflow", () => {
    const gen = createSortableId({
      alphabet: "01",
      randomSize: 2,
      timestampSize: 4,
      now: () => 5,
    });
    const ids = gen.many("e", 10);
    expect(new Set(ids).size).toBe(10);
    expect(ids).toEqual([...ids].sort());
  });

  it("validates count and prefix", () => {
    expect(() => sortableId.many("evt", -1)).toThrow(RangeError);
    expect(() => sortableId.many("", 1)).toThrow(TypeError);
  });
});

describe("IdGenerator compatibility", () => {
  it("still accepts a plain function", () => {
    const gen: IdGenerator = (prefix) =>
      `${prefix}_x` as PrefixedId<typeof prefix>;
    expect(gen("a")).toBe("a_x");
    const asBase: IdGenerator = id;
    expect(asBase("a").startsWith("a_")).toBe(true);
  });
});
