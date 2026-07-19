# prefID

> Type-safe, prefixed IDs like `user_a1b2c3` — always know what an ID belongs to.

[![npm version](https://img.shields.io/npm/v/prefid.svg)](https://www.npmjs.com/package/prefid)
[![CI](https://github.com/suhailopensource/prefID/actions/workflows/ci.yml/badge.svg)](https://github.com/suhailopensource/prefID/actions/workflows/ci.yml)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/prefid.svg)](https://bundlephobia.com/package/prefid)
[![license](https://img.shields.io/npm/l/prefid.svg)](./LICENSE)

**prefID** generates short, unique IDs that carry a prefix telling you what they belong to — `user_a1b2c3`, `order_9f8e7d`. The prefix makes IDs readable in logs, URLs, and your database, and TypeScript understands it, so you can never mix a user ID up with an order ID.

```ts
import { id } from "prefid";

id("user"); // => "user_a8Kd0f2bQ1nR7pZ3xW4mT6y"
id("order"); // => "order_9f8e7d6c5b4a3F2e1D0cB9aX"
```

## Features

- 🏷️ **Self-describing** — the prefix tells you what an ID is at a glance.
- 🧠 **Type-safe** — `id("user")` has the type `` `user_${string}` ``, so passing the wrong ID type is a compile error.
- 🔒 **Secure** — the random part uses the platform's cryptographic RNG, never `Math.random()`.
- 🪶 **Zero dependencies** — tiny and focused on one job.
- 🌍 **Universal** — works in Node, browsers, Deno, Bun, and edge runtimes. Ships ESM + CommonJS.

## Install

```bash
npm install prefid
```

## Usage

### Generate an ID

```ts
import { id } from "prefid";

const userId = id("user"); // "user_a8Kd0f2bQ1nR7pZ3xW4mT6y"
```

### Configure defaults with `createId`

Set the size, separator, or alphabet once and reuse it everywhere:

```ts
import { createId } from "prefid";

const id = createId({ size: 16 });
id("user"); // "user_a1b2c3d4e5f6g7h8"
```

| Option      | Type     | Default              | Description                              |
| ----------- | -------- | -------------------- | ---------------------------------------- |
| `size`      | `number` | `24`                 | Number of random characters.             |
| `separator` | `string` | `"_"`                | Text between the prefix and random part. |
| `alphabet`  | `string` | base62 (`0-9A-Za-z`) | Characters used for the random part.     |

### Guarantee uniqueness with `ensureUnique`

Random IDs almost never collide, but when you want a hard guarantee you can
check each candidate against your own store (a database, cache, or `Set`).
`ensureUnique` runs the retry loop for you and keeps the typed return value:

```ts
import { ensureUnique, id } from "prefid";

const userId = await ensureUnique(
  () => id("user"),
  (candidate) => db.users.exists(candidate), // your check — sync or async
);
// `userId` is typed `user_${string}` and confirmed free in your store
```

A `maxAttempts` guard (default `5`) stops the loop and throws a clear error if
your check keeps reporting collisions, so it can never hang.

### Check and read IDs

```ts
import { getPrefix, isId } from "prefid";

if (isId(value, "user")) {
  // `value` is now typed as `user_${string}`
}

getPrefix("user_a1b2c3"); // "user"
getPrefix("no-separator"); // undefined
```

## How unique are they?

Each default ID has 24 random characters from a 62-character alphabet — about
**142 bits of randomness**, more than a standard UUID. In plain terms: you could
generate a billion IDs per second for tens of thousands of years before two
would ever clash. IDs with different prefixes can never collide.

For an absolute guarantee, do what you'd do with any ID generator — add a
`UNIQUE` (or `PRIMARY KEY`) constraint in your database, and/or use
`ensureUnique` above.

## API

| Export                          | Description                                                        |
| ------------------------------- | ----------------------------------------------------------------- |
| `id(prefix)`                    | Generate a prefixed ID with the default options.                  |
| `createId(options?)`            | Create a generator with a fixed `size` / `separator` / `alphabet`. |
| `ensureUnique(gen, exists, o?)` | Retry generation against your store until a free ID is found.     |
| `isId(value, prefix, sep?)`     | Type guard — narrows `value` to `` `${prefix}_${string}` ``.       |
| `getPrefix(value, sep?)`        | Extract the prefix, or `undefined` if the separator is missing.   |
| `PrefixedId<P>`                 | The type `` `${P}_${string}` ``.                                  |

## Comparison

|            | Prefixes | Type-safe prefix | Secure RNG | Dependencies |
| ---------- | :------: | :--------------: | :--------: | :----------: |
| `uuid`     |    ❌    |        ❌        |     ✅     |      0       |
| `nanoid`   |    ❌    |        ❌        |     ✅     |      0       |
| **prefID** |    ✅    |        ✅        |     ✅     |    **0**     |

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

## License

[MIT](./LICENSE) © Syed Suhail Ahmed
