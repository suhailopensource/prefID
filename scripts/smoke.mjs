import {
  BASE32_CROCKFORD,
  createId,
  createSortableId,
  ensureUnique,
  getPrefix,
  getTimestamp,
  id,
  isId,
  sortableId,
  template,
} from "prefid";

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

// Sortable ids: monotonic within a process and time-decodable.
const sid = sortableId("evt");
assert(isId(sid, "evt"), "sortableId() should produce an evt_ id");
assert(typeof getTimestamp(sid) === "number", "getTimestamp() should decode");

const batch = Array.from({ length: 2000 }, () => sortableId("s"));
const batchSorted = [...batch].sort();
assert(
  batch.every((value, i) => value === batchSorted[i]),
  "sortable ids should already be in ascending order",
);
assert(new Set(batch).size === 2000, "2000 sortable ids should be unique");

const fixedClock = createSortableId({ now: () => 1_700_000_000_000 });
assert(
  getTimestamp(fixedClock("t")) === 1_700_000_000_000,
  "getTimestamp() should round-trip the generating time",
);

// Crockford base32 preset: no ambiguous letters, works everywhere.
assert(BASE32_CROCKFORD.length === 32, "BASE32_CROCKFORD should have 32 chars");
const crock = createId({ alphabet: BASE32_CROCKFORD })("code");
assert(!/[ILOU]/.test(crock), "BASE32_CROCKFORD should omit I/L/O/U");

console.log(`✅ prefid ESM smoke passed on ${runtimeName()} — ${uid} / ${sid}`);
