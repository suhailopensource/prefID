# prefID

> Type-safe, prefixed IDs like `user_a1b2c3` — always know what an ID belongs to.

[![npm version](https://img.shields.io/npm/v/prefid.svg)](https://www.npmjs.com/package/prefid)
[![CI](https://github.com/suhailopensource/prefID/actions/workflows/ci.yml/badge.svg)](https://github.com/suhailopensource/prefID/actions/workflows/ci.yml)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/prefid.svg)](https://bundlephobia.com/package/prefid)
[![license](https://img.shields.io/npm/l/prefid.svg)](./LICENSE)

📖 **[Read the full documentation → prefid.vercel.app](https://prefid.vercel.app)**

**prefID** generates short, unique IDs that carry a prefix telling you what they belong to — `user_a1b2c3`, `order_9f8e7d`. The prefix makes IDs readable in logs, URLs, and your database, and TypeScript understands it, so you can never mix a user ID up with an order ID.

```ts
import { id } from "prefid";

id("user"); // => "user_a8Kd0f2bQ1nR7pZ3xW4mT6y"
id("order"); // => "order_9f8e7d6c5b4a3F2e1D0cB9aX"
```

## Install

```bash
npm install prefid
```

## Features

- 🏷️ **Self-describing** — the prefix tells you what an ID is at a glance.
- 🧠 **Type-safe** — `id("user")` has the type `` `user_${string}` ``, so passing the wrong ID type is a compile error.
- 🔒 **Secure** — the random part uses the platform's cryptographic RNG, never `Math.random()`.
- 🪶 **Zero dependencies** — tiny and focused on one job.
- 🌍 **Universal** — works in Node, browsers, Deno, Bun, and edge runtimes. Ships ESM + CommonJS.

## Documentation

Full guides, examples, and the complete API live on the **[documentation site](https://prefid.vercel.app)**:

| Guide | |
| --- | --- |
| [Quick Start](https://prefid.vercel.app/docs/quick-start) | Generate your first ID |
| [`id()`](https://prefid.vercel.app/docs/api/id) | The default generator |
| [`createId()`](https://prefid.vercel.app/docs/api/create-id) | Configure size, separator, alphabet |
| [`template()`](https://prefid.vercel.app/docs/api/template) | Custom ID layouts (`INV-####-####`) |
| [`ensureUnique()`](https://prefid.vercel.app/docs/api/ensure-unique) | Guarantee an ID is free in your store |
| [`isId()` & `getPrefix()`](https://prefid.vercel.app/docs/api/validation) | Validate and read IDs |
| [Uniqueness & Collisions](https://prefid.vercel.app/docs/uniqueness) | How safe the IDs are |
| [Comparison](https://prefid.vercel.app/docs/comparison) | vs `uuid` and `nanoid` |

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

## License

[MIT](./LICENSE) © Syed Suhail Ahmed
