import { describe, expect, it } from "vitest";
import {
  BASE32_CROCKFORD,
  createId,
  createSortableId,
  getPrefix,
  getTimestamp,
  isId,
  type PrefixedId,
  sortableId,
} from "../src/index.js";

/** A generator driven by an explicit clock we control from the test. */
function withClock(start: number, opts = {}) {
  let now = start;
  const gen = createSortableId({ now: () => now, ...opts });
  return {
    gen,
    set: (value: number) => {
      now = value;
    },
    advance: (delta: number) => {
      now += delta;
    },
  };
}

describe("sortableId() — basics", () => {
  it("produces a prefixed id", () => {
    const value = sortableId("user");
    expect(value.startsWith("user_")).toBe(true);
  });

  it("has a fixed total length (separator + timestamp + random)", () => {
    // default: 9-char base62 timestamp (holds 2^48-1) + 16 random = 25 body chars.
    const a = sortableId("user");
    const b = sortableId("user");
    expect(a.length).toBe(b.length);
    expect(a.slice("user_".length).length).toBe(25);
  });

  it("only uses base62 characters in the body", () => {
    expect(sortableId("user").slice("user_".length)).toMatch(/^[0-9A-Za-z]+$/);
  });

  it("interops with isId() and getPrefix()", () => {
    const value = sortableId("order");
    expect(isId(value, "order")).toBe(true);
    expect(getPrefix(value)).toBe("order");
  });

  it("keeps the prefix in the type", () => {
    const value = sortableId("user");
    const typed: PrefixedId<"user"> = value;
    expect(typed.startsWith("user_")).toBe(true);
  });

  it("generates unique ids across many calls", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50_000; i++) seen.add(sortableId("x"));
    expect(seen.size).toBe(50_000);
  });
});

describe("sortableId() — ordering", () => {
  it("sorts lexicographically in chronological order", () => {
    const { gen, advance } = withClock(1_000_000);
    const ids: string[] = [];
    for (let i = 0; i < 500; i++) {
      ids.push(gen("evt"));
      advance(1); // one ms apart
    }

    // Scramble the order, then a plain string sort must recover insertion order.
    const scrambled = ids
      .map((value, i) => ({ value, key: (i * 7919) % 500 }))
      .sort((a, b) => a.key - b.key)
      .map((entry) => entry.value);
    expect(scrambled.slice().sort()).toEqual(ids);
  });

  it("is strictly increasing within a single millisecond (monotonic)", () => {
    const { gen } = withClock(1_700_000_000_000); // clock never advances
    const ids: string[] = [];
    for (let i = 0; i < 1000; i++) ids.push(gen("u"));

    const sorted = [...ids].sort();
    expect(sorted).toEqual(ids); // already ascending
    expect(new Set(ids).size).toBe(1000); // and unique
    for (let i = 1; i < ids.length; i++) {
      expect(ids[i] > ids[i - 1]).toBe(true);
    }
  });

  it("stays ordered even when the clock jumps backwards", () => {
    const { gen, set } = withClock(5_000_000);
    const a = gen("u");
    set(4_000_000); // clock rewinds 1000s
    const b = gen("u");
    set(4_500_000);
    const c = gen("u");
    expect(b > a).toBe(true);
    expect(c > b).toBe(true);
  });

  it("embeds a timestamp that increases with real time", () => {
    const { gen, set } = withClock(1_000);
    const early = gen("u");
    set(9_999_999);
    const late = gen("u");
    expect(getTimestamp(late)!).toBeGreaterThan(getTimestamp(early)!);
  });
});

describe("sortableId() — monotonic overflow", () => {
  it("spills into the next millisecond when the random tail is exhausted", () => {
    // radix 2, randomSize 2 => only 4 tail combinations per ms.
    const { gen } = withClock(100, { alphabet: "01", randomSize: 2 });
    const ids: string[] = [];
    for (let i = 0; i < 10; i++) ids.push(gen("b"));

    // Strictly increasing and unique despite the tiny tail space.
    expect(new Set(ids).size).toBe(10);
    for (let i = 1; i < ids.length; i++) {
      expect(ids[i] > ids[i - 1]).toBe(true);
    }

    // The embedded timestamp must have advanced past the frozen clock (100).
    const last = getTimestamp(ids[ids.length - 1], { alphabet: "01" });
    expect(last!).toBeGreaterThan(100);
  });
});

describe("getTimestamp()", () => {
  it("round-trips the generating timestamp", () => {
    const { gen } = withClock(1_723_456_789_012);
    expect(getTimestamp(gen("u"))).toBe(1_723_456_789_012);
  });

  it("round-trips with a custom sorted alphabet", () => {
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"; // base36, ascending
    const { gen } = withClock(1_700_000_000_000, { alphabet });
    const value = gen("u");
    expect(getTimestamp(value, { alphabet })).toBe(1_700_000_000_000);
  });

  it("respects a custom separator", () => {
    const { gen } = withClock(42_000, { separator: "-" });
    const value = gen("u");
    expect(getTimestamp(value, { separator: "-" })).toBe(42_000);
  });

  it("returns undefined for non-strings", () => {
    expect(getTimestamp(123 as unknown as string)).toBeUndefined();
    expect(getTimestamp(null as unknown as string)).toBeUndefined();
  });

  it("returns undefined when there is no separator", () => {
    expect(getTimestamp("noseparator")).toBeUndefined();
  });

  it("returns undefined when the body is too short", () => {
    expect(getTimestamp("u_ab")).toBeUndefined();
  });

  it("returns undefined when the timestamp contains out-of-alphabet chars", () => {
    // '-' is not in base62, so decoding must fail cleanly.
    expect(getTimestamp("u_----------aaaaaaaaaaaaaaaa")).toBeUndefined();
  });
});

describe("createSortableId() — configuration", () => {
  it("respects a custom randomSize", () => {
    const gen = createSortableId({ randomSize: 4 });
    const body = gen("u").slice("u_".length);
    // default timestamp is 9 base62 chars + 4 random.
    expect(body.length).toBe(9 + 4);
  });

  it("respects a custom timestampSize", () => {
    const gen = createSortableId({ timestampSize: 12, randomSize: 4 });
    expect(gen("u").slice("u_".length).length).toBe(12 + 4);
  });

  it("supports a non-monotonic (stateless) mode", () => {
    const { gen } = withClock(1_000, { monotonic: false });
    const a = gen("u");
    const b = gen("u");
    // Same ms, fresh random each time — timestamps equal, values (near-certainly) differ.
    expect(getTimestamp(a)).toBe(getTimestamp(b));
    expect(a).not.toBe(b);
  });
});

describe("BASE32_CROCKFORD preset", () => {
  it("is the 32-character Crockford alphabet without I, L, O, U", () => {
    expect(BASE32_CROCKFORD).toBe("0123456789ABCDEFGHJKMNPQRSTVWXYZ");
    expect(BASE32_CROCKFORD.length).toBe(32);
    for (const ambiguous of ["I", "L", "O", "U"]) {
      expect(BASE32_CROCKFORD.includes(ambiguous)).toBe(false);
    }
  });

  it("is in strictly ascending code-point order (sortable-ready)", () => {
    for (let i = 1; i < BASE32_CROCKFORD.length; i++) {
      expect(BASE32_CROCKFORD.charCodeAt(i)).toBeGreaterThan(
        BASE32_CROCKFORD.charCodeAt(i - 1),
      );
    }
  });

  it("works as a plain createId() alphabet", () => {
    const gen = createId({ alphabet: BASE32_CROCKFORD, size: 20 });
    expect(gen("code").slice("code_".length)).toMatch(
      /^[0-9A-HJKMNP-TV-Z]{20}$/,
    );
  });

  it("works with createSortableId() and stays sortable", () => {
    let now = 1_000_000;
    const gen = createSortableId({
      alphabet: BASE32_CROCKFORD,
      now: () => now,
    });
    const ids: string[] = [];
    for (let i = 0; i < 200; i++) {
      ids.push(gen("evt"));
      now += 1;
    }
    expect([...ids].sort()).toEqual(ids);
    expect(new Set(ids).size).toBe(200);
  });

  it("round-trips the timestamp with getTimestamp()", () => {
    const gen = createSortableId({
      alphabet: BASE32_CROCKFORD,
      now: () => 1_723_456_789_012,
    });
    const value = gen("evt");
    expect(getTimestamp(value, { alphabet: BASE32_CROCKFORD })).toBe(
      1_723_456_789_012,
    );
  });
});

describe("createSortableId() — validation", () => {
  it("rejects a non-ascending alphabet (breaks sortability)", () => {
    expect(() => createSortableId({ alphabet: "ba" })).toThrow(RangeError);
    expect(() => createSortableId({ alphabet: "0102" })).toThrow(RangeError);
    expect(() => createSortableId({ alphabet: "aa" })).toThrow(RangeError);
  });

  it("accepts the default base62 alphabet (it is ascending)", () => {
    expect(() => createSortableId()).not.toThrow();
  });

  it("rejects an alphabet shorter than 2 characters", () => {
    expect(() => createSortableId({ alphabet: "x" })).toThrow(RangeError);
  });

  it("rejects an empty separator", () => {
    expect(() => createSortableId({ separator: "" })).toThrow(TypeError);
  });

  it("rejects invalid randomSize / timestampSize", () => {
    expect(() => createSortableId({ randomSize: 0 })).toThrow(RangeError);
    expect(() => createSortableId({ randomSize: 1.5 })).toThrow(RangeError);
    expect(() => createSortableId({ timestampSize: 0 })).toThrow(RangeError);
    expect(() => createSortableId({ randomSize: 4097 })).toThrow(RangeError);
  });

  it("rejects an invalid prefix, like the other generators", () => {
    const gen = createSortableId();
    expect(() => gen("")).toThrow(TypeError);
    expect(() => gen("us_er")).toThrow(TypeError);
  });

  it("throws when a timestamp cannot fit in the configured width", () => {
    // 1 base62 char holds only 0..61; a real ms timestamp is far larger.
    const gen = createSortableId({ timestampSize: 1, now: () => 1_000_000 });
    expect(() => gen("u")).toThrow(RangeError);
  });

  it("rejects a non-function clock", () => {
    expect(() =>
      createSortableId({ now: 123 as unknown as () => number }),
    ).toThrow(TypeError);
  });

  it("rejects a non-finite clock reading", () => {
    const gen = createSortableId({ now: () => Number.NaN });
    expect(() => gen("u")).toThrow(TypeError);
  });

  it("rejects a negative clock reading", () => {
    const gen = createSortableId({ now: () => -1 });
    expect(() => gen("u")).toThrow(RangeError);
  });
});
