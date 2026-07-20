# Contributing to prefid

Thanks for your interest in improving `prefid`! 🎉

## Development setup

```bash
git clone https://github.com/suhailopensource/prefID.git
cd prefid
npm install
```

## Useful scripts

| Script                  | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `npm test`              | Run the test suite once.                      |
| `npm run test:watch`    | Run tests in watch mode.                      |
| `npm run test:coverage` | Run tests with a coverage report.             |
| `npm run typecheck`     | Type-check without emitting output.           |
| `npm run format`        | Format the codebase with Prettier.            |
| `npm run format:check`  | Verify formatting (used in CI).               |
| `npm run build`         | Build `dist/` with tsup.                      |

## Before you open a pull request

1. Add or update tests for your change.
2. Run `npm run format`, `npm run typecheck`, and `npm test` — all must pass.
3. Keep the package **dependency-free** (nothing in `dependencies`).
4. Update `CHANGELOG.md` under the `Unreleased` heading.

## Project layout

```
src/
  index.ts         Public entry point (barrel of exports)
  generate.ts      createId + the default `id` generator
  ensure-unique.ts ensureUnique helper
  validate.ts      isId + getPrefix
  random.ts        Internal CSPRNG helpers (not exported publicly)
  constants.ts     Default alphabet / size / separator
  types.ts         Public types
test/              One test file per source module
```

## Code style

- TypeScript, strict mode, no runtime dependencies.
- Prefer small, focused, well-documented functions.
- Public functions get a JSDoc block with an `@example`.
