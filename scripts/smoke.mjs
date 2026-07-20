import { createId, ensureUnique, getPrefix, id, isId, template } from "prefid";

function assert(condition, message) {
  if (!condition) throw new Error(`smoke failed: ${message}`);
}

function runtimeName() {
  if (typeof Deno !== "undefined") return `Deno ${Deno.version.deno}`;
  if (typeof Bun !== "undefined") return `Bun ${Bun.version}`;
  if (typeof process !== "undefined" && process.versions?.node) {
    return `Node ${process.versions.node}`;
  }
  return "unknown runtime";
}

const uid = id("user");
assert(isId(uid, "user"), "id() should produce a user_ id");
assert(getPrefix(uid) === "user", "getPrefix() should return the prefix");

const short = createId({ size: 8 })("order");
assert(short.length === "order_".length + 8, "createId({ size }) length");

const code = template("t-####")();
assert(/^t-[0-9A-Za-z]{4}$/.test(code), "template() shape");

const unique = await ensureUnique(
  () => id("u"),
  (candidate) => !isId(candidate, "u"),
);
assert(isId(unique, "u"), "ensureUnique() result");

const seen = new Set(Array.from({ length: 5000 }, () => id("x")));
assert(seen.size === 5000, "5000 ids should be unique");

console.log(`✅ prefid ESM smoke passed on ${runtimeName()} — ${uid}`);
