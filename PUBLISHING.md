# Publishing `prefid` to npm

A step-by-step checklist. Run everything from inside the `prefid/` folder.

---

## 0. One-time setup

### Create an npm account
Sign up at <https://www.npmjs.com/signup> (free).

### Enable 2FA (recommended)
Account → Settings → Two-Factor Authentication → enable for **Authorization and Publishing**.
This protects your package from being hijacked.

### Log in from the CLI
```bash
npm login
```
Follow the browser prompt. Verify you are logged in:
```bash
npm whoami
```

---

## 1. Pick a name that is free

The name in `package.json` (`"name": "prefid"`) must be unique on npm. Check it:

```bash
npm view prefid
```

- **"404 Not Found"** → the name is free, you're good. 🎉
- **Shows package info** → it's taken. Either:
  - choose another name (edit `"name"` in `package.json`), **or**
  - publish under your own scope (always available):
    ```jsonc
    // package.json
    "name": "@your-npm-username/prefid"
    ```
    Scoped public packages need `--access public` when publishing (see step 5).

---

## 2. Final checks before publishing

```bash
npm install     # install dev tools (first time only)
npm run typecheck
npm test
npm run build   # outputs the dist/ folder that actually ships
```

All three must pass. `dist/` is what users download — `src/` and `test/` are excluded via the `"files"` field in `package.json`.

---

## 3. Preview exactly what will be published

This does **not** publish — it just prints the file list and tarball size:

```bash
npm publish --dry-run
```

You should see only `dist/`, `package.json`, `README.md`, and `LICENSE`.
If you see `src/`, `node_modules/`, or test files, fix the `"files"` array first.

---

## 4. Set the version

Follow [semver](https://semver.org/): `MAJOR.MINOR.PATCH`.

- First release can stay at the current `0.1.0`, **or** go straight to `1.0.0`.
- For later releases, let npm bump it and create a git tag for you:

```bash
npm version patch   # 1.0.0 -> 1.0.1  (bug fixes)
npm version minor   # 1.0.1 -> 1.1.0  (new features, backwards compatible)
npm version major   # 1.1.0 -> 2.0.0  (breaking changes)
```

---

## 5. Publish

```bash
npm publish
```

For a **scoped** name (`@your-username/prefid`), make it public:

```bash
npm publish --access public
```

The `prepublishOnly` script runs `npm run build` automatically first, so `dist/` is always fresh.

Your package is now live at `https://www.npmjs.com/package/<name>`. 🚀

---

## 6. Releasing an update later

```bash
# make your changes, then:
npm test
npm version patch      # bumps version + creates a git commit and tag
npm publish
git push --follow-tags # push the version commit + tag to GitHub
```

---

## Handy commands

| Command                       | What it does                                  |
| ----------------------------- | --------------------------------------------- |
| `npm whoami`                  | Check which npm account you're logged in as.  |
| `npm view <name>`             | See if a name exists / inspect a package.     |
| `npm publish --dry-run`       | Preview the publish without doing it.         |
| `npm version <patch\|minor\|major>` | Bump version + git tag.                 |
| `npm unpublish <name> --force`| Remove a package (only within 72h; avoid).    |
| `npm deprecate <name> "msg"`  | Mark a version deprecated (preferred over unpublish). |

## Notes & gotchas

- **You cannot re-publish the same version.** Every `npm publish` needs a new version number.
- **Avoid `npm unpublish`.** It breaks anyone depending on you and the name is locked for 24h. Use `npm deprecate` instead.
- **Never commit secrets.** `.npmrc` tokens and `.env` files should stay out of git (already in `.gitignore`).
- **`files` allowlist > `.npmignore`.** This project uses `"files": ["dist"]` so only build output ships — safer by default.
