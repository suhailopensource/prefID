# prefid

> Type-safe, Stripe-style prefixed IDs like `user_a1b2c3`, `order_9f8e7d` — you always know what an ID belongs to.

Tiny (**zero runtime dependencies**), secure (**cryptographically random**), and fully typed. Inspired by Stripe's `cus_...` / `pi_...` identifiers and by [`nanoid`](https://github.com/ai/nanoid)'s unbiased generation.

```ts
import { id } from "prefid";

id("user"); // => "user_a8Kd0f2bQ1nR7pZ3xW4mT6y"
id("order"); // => "order_9f8e7d6c5b4a3F2e1D0cB9aX"
```

## Why

- **Self-describing** — the prefix tells you what an ID is at a glance, in logs, URLs, and databases.
- **Type-safe** — `id("user")` returns the type `` `user_${string}` ``, so you can't accidentally pass an order ID where a user ID is expected.
- **Secure** — the random part uses `crypto.getRandomValues` with unbiased (rejection) sampling. No `Math.random()`.
- **Zero dependencies** — nothing in `dependencies`.
- **Universal** — works in Node 18+, browsers, Deno, Bun, and edge runtimes. ESM + CJS.

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

### Configure once with `createId`

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

### Guaranteed-unique IDs with `ensureUnique`

Random IDs are collision-resistant by probability. When you want a hard
guarantee, check candidates against your source of truth (a DB, cache, or Set).
`ensureUnique` handles the retry loop — and keeps your typed return value:

```ts
import { ensureUnique, id } from "prefid";

const userId = await ensureUnique(
  () => id("user"),
  (candidate) => db.users.exists(candidate), // sync or async
);
// userId is typed `user_${string}`, and guaranteed free in your store
```

It works with any store because you supply the check:

```ts
ensureUnique(() => id("user"), (c) => prisma.user.count({ where: { id: c } }).then((n) => n > 0));
ensureUnique(() => id("user"), (c) => redis.exists(c).then(Boolean));
ensureUnique(() => id("user"), (c) => seen.has(c)); // a plain Set
```

A `maxAttempts` guard (default `5`) prevents an infinite loop if `exists` is
buggy — it throws a clear error instead of hanging.

### Validate an ID

```ts
import { isId } from "prefid";

if (isId(value, "user")) {
  value.toUpperCase(); // `value` is now typed as `user_${string}`
}
```

### Read the prefix

```ts
import { getPrefix } from "prefid";

getPrefix("user_a1b2c3"); // "user"
getPrefix("no-separator"); // undefined
```

## API

| Export                         | Description                                                       |
| ------------------------------ | ----------------------------------------------------------------- |
| `id(prefix)`                   | Generate a prefixed ID with the default options.                  |
| `createId(options?)`           | Create a generator with fixed `size` / `separator` / `alphabet`.  |
| `ensureUnique(gen, exists, o?)`| Retry generation against your store until a free ID is found.     |
| `isId(value, prefix, sep?)`    | Type guard — narrows `value` to `` `${prefix}_${string}` ``.       |
| `getPrefix(value, sep?)`       | Extract the prefix, or `undefined` if the separator is missing.   |
| `PrefixedId<P>`                | The type `` `${P}_${string}` ``.                                  |

## Uniqueness & collisions

The default ID has 24 characters from a 62-character alphabet ≈ **142 bits of
entropy** — more than a UUID v4 (122 bits). You would have to generate roughly
a billion IDs per second for tens of thousands of years to reach a coin-flip
chance of a single collision.

Randomness comes from the platform CSPRNG (`crypto.getRandomValues`), and
characters are chosen with masking + rejection so every character is equally
likely (no modulo bias). Two IDs with **different prefixes can never collide**.

For an absolute guarantee, pair the ID with a `UNIQUE` / `PRIMARY KEY`
constraint in your database (the same practice used with `uuid`), and/or use
`ensureUnique` above.

## Comparison

| Library      | Prefixes | Type-safe prefix | Secure RNG | Dependencies |
| ------------ | :------: | :--------------: | :--------: | :----------: |
| `uuid`       |    ❌    |        ❌        |     ✅     |      0       |
| `nanoid`     |    ❌    |        ❌        |     ✅     |      0       |
| **prefid** |    ✅    |        ✅        |     ✅     |    **0**     |

## Project structure

```
src/
  index.ts          Public entry point (barrel of exports)
  generate.ts       createId + the default `id` generator
  ensure-unique.ts  ensureUnique helper
  validate.ts       isId + getPrefix
  random.ts         Internal CSPRNG helpers
  constants.ts      Default alphabet / size / separator
  types.ts          Public types
```

## License

[MIT](./LICENSE) © Syed Suhail Ahmed
