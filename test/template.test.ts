import { describe, expect, it } from "vitest";
import { template } from "../src/index.js";

describe("template()", () => {
  it("replaces placeholders and keeps literals", () => {
    expect(template("user_####")()).toMatch(/^user_[0-9A-Za-z]{4}$/);
  });

  it("fills the exact number of placeholders", () => {
    expect(template("INV-##-##")()).toMatch(
      /^INV-[0-9A-Za-z]{2}-[0-9A-Za-z]{2}$/,
    );
  });

  it("keeps every literal character unchanged", () => {
    const value = template("a#b#c")();
    expect(value.length).toBe(5);
    expect(value[0]).toBe("a");
    expect(value[2]).toBe("b");
    expect(value[4]).toBe("c");
  });

  it("generates a fresh value on each call", () => {
    const gen = template("id_########");
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(gen());
    expect(seen.size).toBe(1000);
  });

  it("supports a custom placeholder", () => {
    expect(template("room-***", { placeholder: "*" })()).toMatch(
      /^room-[0-9A-Za-z]{3}$/,
    );
  });

  it("treats the default '#' as a literal when a custom placeholder is set", () => {
    const value = template("a#*", { placeholder: "*" })();
    expect(value.length).toBe(3);
    expect(value.startsWith("a#")).toBe(true);
  });

  it("supports a custom alphabet", () => {
    expect(template("pin-####", { alphabet: "0123456789" })()).toMatch(
      /^pin-[0-9]{4}$/,
    );
  });

  it("throws on an empty pattern", () => {
    expect(() => template("")).toThrow(TypeError);
  });

  it("throws when the pattern has no placeholder", () => {
    expect(() => template("noplaceholder")).toThrow(RangeError);
  });

  it("throws when the pattern exceeds the placeholder maximum (DoS guard)", () => {
    expect(() => template("#".repeat(4097))).toThrow(RangeError);
    expect(() => template("#".repeat(2_000_000))).toThrow(RangeError);
  });

  it("accepts the maximum placeholder count boundary", () => {
    const gen = template("#".repeat(4096));
    expect(gen().length).toBe(4096);
  });

  it("throws on a multi-character placeholder", () => {
    expect(() => template("a##", { placeholder: "##" })).toThrow(RangeError);
  });

  it("throws on an alphabet shorter than 2 characters", () => {
    expect(() => template("a#", { alphabet: "x" })).toThrow(RangeError);
  });

  it("preserves the literal prefix in the type", () => {
    const value = template("user_####")();
    const typed: `user_${string}` = value;
    expect(typed.startsWith("user_")).toBe(true);
  });
});
