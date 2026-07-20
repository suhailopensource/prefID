import { describe, expect, it, vi } from "vitest";
import { ensureUnique, id } from "../src/index.js";

describe("ensureUnique()", () => {
  it("returns the first candidate when it is free", async () => {
    const generate = vi.fn(() => "user_aaa");
    const exists = vi.fn(async () => false);

    const result = await ensureUnique(generate, exists);

    expect(result).toBe("user_aaa");
    expect(generate).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenCalledTimes(1);
  });

  it("retries until it finds a free id", async () => {
    const taken = new Set(["user_0", "user_1"]);
    let n = 0;
    const generate = () => `user_${n++}`;

    const result = await ensureUnique(generate, (c) => taken.has(c));

    expect(result).toBe("user_2");
  });

  it("accepts a synchronous exists function", async () => {
    const result = await ensureUnique(
      () => "user_a",
      () => false,
    );
    expect(result).toBe("user_a");
  });

  it("throws after maxAttempts when everything is taken", async () => {
    await expect(
      ensureUnique(
        () => "user_x",
        () => true,
        { maxAttempts: 3 },
      ),
    ).rejects.toThrow(/unique id after 3 attempts/);
  });

  it("rejects an invalid maxAttempts", async () => {
    await expect(
      ensureUnique(
        () => "user_a",
        () => false,
        { maxAttempts: 0 },
      ),
    ).rejects.toThrow(RangeError);
  });

  it("preserves the prefixed id type", async () => {
    const result = await ensureUnique(
      () => id("user"),
      () => false,
    );
    // Compile-time assertion: the result keeps its `user_${string}` type.
    const typed: `user_${string}` = result;
    expect(typed.startsWith("user_")).toBe(true);
  });
});
