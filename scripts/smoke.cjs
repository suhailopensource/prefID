const { id, isId, getPrefix } = require("prefid");

const uid = id("user");

if (!isId(uid, "user") || getPrefix(uid) !== "user") {
  console.error("smoke failed: CJS build did not produce a valid id");
  process.exit(1);
}

console.log(
  `✅ prefid CJS smoke passed on Node ${process.versions.node} — ${uid}`,
);
