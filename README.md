<div align="center">

# prefID

**Type-safe, prefixed IDs like `user_a1b2c3` for TypeScript & JavaScript — always know what an ID belongs to.**

[![npm version](https://img.shields.io/npm/v/prefid?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/prefid)
[![downloads](https://img.shields.io/npm/dm/prefid?style=flat-square&color=cb3837)](https://www.npmjs.com/package/prefid)
[![CI](https://img.shields.io/github/actions/workflow/status/suhailopensource/prefID/ci.yml?style=flat-square&logo=github&label=CI)](https://github.com/suhailopensource/prefID/actions/workflows/ci.yml)
[![minzipped size](https://img.shields.io/bundlejs/size/prefid?style=flat-square&label=minzipped)](https://bundlejs.com/?q=prefid)
[![types](https://img.shields.io/npm/types/prefid?style=flat-square&logo=typescript&label=types)](https://www.npmjs.com/package/prefid)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](https://www.npmjs.com/package/prefid?activeTab=dependencies)
[![license](https://img.shields.io/npm/l/prefid?style=flat-square&color=blue)](./LICENSE)

📖 **[Read the full documentation → prefid.vercel.app](https://prefid.vercel.app)**

</div>

**prefID** generates short, unique IDs that carry a prefix telling you what they belong to — `user_a1b2c3`, `order_9f8e7d`. The prefix makes IDs readable in logs, URLs, and your database, and TypeScript understands it, so you can never mix a user ID up with an order ID.

```ts
import { id } from "prefid";

id("user"); // => "user_a8Kd0f2bQ1nR7pZ3xW4mT6y"
id("order"); // => "order_9f8e7d6c5b4a3F2e1D0cB9aX"
```

## Sortable IDs

Need IDs that sort by creation time? `sortableId` puts a time component up front,
so a plain string sort is also a chronological sort — the idea behind ULID and
UUIDv7, but keeping prefID's prefix and type. Great for database keys, cursors,
and correlating logs, without a central sequence:

```ts
import { sortableId, getTimestamp } from "prefid";

sortableId("evt"); // => "evt_00VQ5a1k0lBjgjfx6pwYy6WkY"
sortableId("evt"); // => "evt_00VQ5a1mgkWGzAvv93g1bC3yR"  ← later, and sorts after

// IDs created in the same millisecond (or if the clock steps backwards) are
// still strictly increasing — monotonic by default.

getTimestamp("evt_00VQ5a1k0lBjgjfx6pwYy6WkY"); // => 1721600000000 (ms)
```

Prefer a case-insensitive, unambiguous alphabet (like ULID)? Use the exported
`BASE32_CROCKFORD` preset — it drops the look-alike letters `I`, `L`, `O`, `U`:

```ts
import { createSortableId, BASE32_CROCKFORD } from "prefid";

const eventId = createSortableId({ alphabet: BASE32_CROCKFORD });
eventId("evt"); // => "evt_00VQ5A1K0MBJGJFX6PWYY6WKY" — no 0/O or 1/l confusion
```

## Install

```bash
npm install prefid
```

## Features

- 🏷️ **Self-describing** — the prefix tells you what an ID is at a glance.
- 🧠 **Type-safe** — `id("user")` has the type `` `user_${string}` ``, so passing the wrong ID type is a compile error.
- 🔀 **Sortable option** — `sortableId("evt")` embeds a time component so IDs sort chronologically as plain strings (ULID / UUIDv7-style), with no central coordinator.
- 🟨 **JavaScript too** — TypeScript is optional. Works the same in plain JS; types are a bonus, not a requirement.
- 🔒 **Secure** — the random part uses the platform's cryptographic RNG, never `Math.random()`.
- 🪶 **Zero dependencies** — tiny and focused on one job.
- 🌍 **Universal** — works in Node 14.18+, browsers, Deno, Bun, and edge runtimes. Ships ESM + CommonJS.

## JavaScript or TypeScript

prefID works in **plain JavaScript** just as well as in TypeScript — the published package is already compiled JavaScript, so there's nothing to compile on your end:

```js
// CommonJS
const { id } = require("prefid");
// or ESM: import { id } from "prefid";

id("user"); // "user_a8Kd0f2bQ1nR7pZ3xW4mT6y"
```

Everything (`id`, `createId`, `template`, `ensureUnique`, `isId`, `getPrefix`) runs identically in JS. TypeScript users get one extra thing on top — the typed prefix (`` `user_${string}` ``) that catches wrong-ID mistakes at compile time. JS users still get editor autocomplete from the bundled type definitions.

## Compatibility

prefid runs anywhere with a cryptographic RNG, and picks the right source automatically:

| Runtime | Random source |
| --- | --- |
| Node.js **14.18+** (ESM + CommonJS) | `node:crypto` |
| Browsers, Deno, Bun, edge runtimes | `globalThis.crypto` |

Node 14.18 is the minimum because it's the first release with `require("node:crypto")`. On Node ESM versions that don't expose a global `crypto` (14–19), a Node-specific entry point (selected automatically via the package's `exports` conditions) sources randomness from `node:crypto` — so ESM works there too.

## Documentation

Full guides, examples, and the complete API live on the **[documentation site](https://prefid.vercel.app)**:

| Guide | |
| --- | --- |
| [Quick Start](https://prefid.vercel.app/docs/quick-start) | Generate your first ID |
| [`id()`](https://prefid.vercel.app/docs/api/id) | The default generator |
| [`createId()`](https://prefid.vercel.app/docs/api/create-id) | Configure size, separator, alphabet |
| [`sortableId()`](https://prefid.vercel.app/docs/api/sortable-id) | Time-ordered IDs (ULID / UUIDv7-style) |
| [`template()`](https://prefid.vercel.app/docs/api/template) | Custom ID layouts (`INV-####-####`) |
| [`ensureUnique()`](https://prefid.vercel.app/docs/api/ensure-unique) | Guarantee an ID is free in your store |
| [`isId()` & `getPrefix()`](https://prefid.vercel.app/docs/api/validation) | Validate and read IDs |
| [Uniqueness & Collisions](https://prefid.vercel.app/docs/uniqueness) | How safe the IDs are |
| [Comparison](https://prefid.vercel.app/docs/comparison) | vs `uuid` and `nanoid` |

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

## License

[MIT](./LICENSE) © Syed Suhail Ahmed
