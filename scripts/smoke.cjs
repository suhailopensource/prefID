const {
  id,
  isId,
  parseId,
  getPrefix,
  sortableId,
  getTimestamp,
  getTimestampOrThrow,
  getDate,
} = require("prefid");

const uid = id("user");

if (!isId(uid, "user") || getPrefix(uid) !== "user") {
  console.error("smoke failed: CJS build did not produce a valid id");
  process.exit(1);
}

const parsed = parseId(uid);
if (!parsed || parsed.prefix !== "user" || parsed.id !== uid.substring(5)) {
  console.error("smoke failed: parseId() should round-trip a generated id");
  process.exit(1);
}
if (parseId("nosep") !== undefined) {
  console.error(
    "smoke failed: parseId() should return undefined when separator is missing",
  );
  process.exit(1);
}
if (parseId(null) !== undefined) {
  console.error(
    "smoke failed: parseId() should return undefined for non-string input",
  );
  process.exit(1);
}

const sid = sortableId("evt");
if (
  !isId(sid, "evt") ||
  typeof getTimestamp(sid) !== "number" ||
  typeof getTimestampOrThrow(sid) !== "number" ||
  !(getDate(sid) instanceof Date)
) {
  console.error("smoke failed: CJS build did not produce a valid sortable id");
  process.exit(1);
}

console.log(
  `✅ prefid CJS smoke passed on Node ${process.versions.node} — ${uid} / ${sid}`,
);
