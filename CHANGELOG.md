# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-07-20

### Added

- Cross-runtime smoke tests (Node ESM + CJS, Bun, Deno) run in CI on every push,
  across Node 14.18, 16, 18, 20, 22, and 24.
- Node-specific entry point (selected via the `node` export condition) that sources
  secure random bytes from `node:crypto`. This fixes ID generation on **Node ESM
  versions without a global `crypto`** (Node 14–19 in ES modules), where
  `globalThis.crypto` is not a global and there is no `require`. Browsers, Deno,
  Bun, and edge runtimes continue to use `globalThis.crypto`.
- Unit tests for the random-bytes provider indirection, including the
  `node:crypto`-backed path that older Node ESM relies on.

### Changed

- **Minimum supported Node.js is now 14.18** (down from an interim 20). 14.18 is
  the first release with `require("node:crypto")`, which the CommonJS build needs.
  The build target was lowered to `es2020` to guarantee Node 14-parseable output.

### Security

- Cap the number of random characters generated per call at **4096**
  (`createId`'s `size` and `template`'s placeholder count). Prevents a huge value
  from exhausting CPU/memory when it originates from untrusted input; both now
  throw a `RangeError` above the limit. Default behaviour is unchanged.

## [0.2.0] - 2026-07-20

### Added

- `template(pattern, options)` — generate IDs from a custom pattern where each
  `#` becomes a secure random character (e.g. `INV-####-####`), with
  configurable `placeholder` and `alphabet`.

### Changed

- Moved the internal CSPRNG helpers to `src/internal/random.ts`.
- Documentation moved to the dedicated site at https://prefid.vercel.app; the
  README now links there instead of duplicating the full API.

## [0.1.0] - 2026-07-19

### Added

- `id(prefix)` — generate a type-safe, prefixed id.
- `createId(options)` — configure `size`, `separator`, and `alphabet`.
- `ensureUnique(generate, exists, options)` — retry generation against your own
  store until a free id is found, with a `maxAttempts` guard.
- `isId(value, prefix)` — type guard that narrows to `PrefixedId<P>`.
- `getPrefix(value)` — extract the prefix from an id.
- Cryptographically secure random source with unbiased sampling and a Node
  `crypto` fallback for runtimes without the Web Crypto global.

[Unreleased]: https://github.com/suhailopensource/prefID/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/suhailopensource/prefID/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/suhailopensource/prefID/releases/tag/v0.1.0
