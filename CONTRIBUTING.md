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
| `npm run smoke`         | Run the ESM + CJS smoke tests (Node).         |

## Before you open a pull request

1. Add or update tests for your change.
2. Run `npm run format`, `npm run typecheck`, and `npm test` — all must pass.
3. Keep the package **dependency-free** (nothing in `dependencies`).
4. Update `CHANGELOG.md` under the `Unreleased` heading.

## Project layout

```
src/
  index.ts             Public entry point (barrel of exports)
  index.node.ts        Node-specific entry (injects node:crypto)
  constants/
    index.ts           Default alphabet / size / separator / sortable + BASE32_CROCKFORD
  types/
    index.ts           Public types (PrefixedId, IdOptions, IdGenerator)
  generators/
    generate.ts        createId + the default `id` generator
    sortable.ts        createSortableId + sortableId + getTimestamp
    template.ts        template
  utils/
    validate.ts        isId + getPrefix
    ensure-unique.ts   ensureUnique helper
  internal/
    random.ts          CSPRNG helpers + randomIndices/randomString (not exported publicly)
    prefix.ts          Shared prefix validation (not exported publicly)
test/                  One test file per source module
scripts/               Cross-runtime smoke tests (smoke.mjs, smoke.cjs, browser-smoke.html)
```

## Code style

- TypeScript, strict mode, no runtime dependencies.
- Prefer small, focused functions with clear, self-explanatory names.
- Keep the code comment-free; document behavior in the README and tests.
