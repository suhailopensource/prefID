import { describe, expect, it } from "vitest";
import { getPrefix, id, isId, parseId, type PrefixedId } from "../src/index.js";

describe("isId()", () => {
  it("returns true for a matching prefix", () => {
    expect(isId("user_abc123", "user")).toBe(true);
  });

  it("returns false for a different prefix", () => {
    expect(isId("order_abc123", "user")).toBe(false);
  });

  it("returns false for non-strings", () => {
    expect(isId(42, "user")).toBe(false);
    expect(isId(null, "user")).toBe(false);
    expect(isId(undefined, "user")).toBe(false);
  });

  it("supports a custom separator", () => {
    expect(isId("user.abc", "user", ".")).toBe(true);
    expect(isId("user_abc", "user", ".")).toBe(false);
  });

  it("narrows the type", () => {
    const value: unknown = id("user");
    if (isId(value, "user")) {
      const typed: PrefixedId<"user"> = value;
      expect(typed.startsWith("user_")).toBe(true);
    }
  });

  it("narrows to the custom-separator type", () => {
    const value: unknown = "user-abc123";
    if (isId(value, "user", "-")) {
      const typed: PrefixedId<"user", "-"> = value;
      expect(typed.startsWith("user-")).toBe(true);
    }
  });
});

describe("getPrefix()", () => {
  it("returns the prefix", () => {
    expect(getPrefix("user_abc123")).toBe("user");
  });

  it("returns undefined when there is no separator", () => {
    expect(getPrefix("noseparator")).toBeUndefined();
  });

  it("returns undefined when the separator is leading", () => {
    expect(getPrefix("_abc")).toBeUndefined();
  });

  it("supports a custom separator", () => {
    expect(getPrefix("user.abc", ".")).toBe("user");
  });

  it("returns undefined for non-strings", () => {
    expect(getPrefix(null as unknown as string)).toBeUndefined();
    expect(getPrefix(undefined as unknown as string)).toBeUndefined();
    expect(getPrefix(42 as unknown as string)).toBeUndefined();
    expect(getPrefix({} as unknown as string)).toBeUndefined();
  });
});

describe("parseId()", () => {
  it("returns prefix and id for a valid prefixed ID", () => {
    expect(parseId("user_abc123")).toEqual({ prefix: "user", id: "abc123" });
  });

  it("returns undefined when there is no separator", () => {
    expect(parseId("noseparator")).toBeUndefined();
  });

  it("returns undefined when the separator is leading", () => {
    expect(parseId("_abc")).toBeUndefined();
  });

  it("supports a custom separator", () => {
    expect(parseId("user.abc", ".")).toEqual({ prefix: "user", id: "abc" });
  });

  it("returns undefined for non-strings", () => {
    expect(parseId(null as unknown as string)).toBeUndefined();
    expect(parseId(undefined as unknown as string)).toBeUndefined();
    expect(parseId(42 as unknown as string)).toBeUndefined();
    expect(parseId({} as unknown as string)).toBeUndefined();
  });
});
