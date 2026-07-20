# Security Policy

## Randomness

`prefid` generates the random portion of every id using a cryptographically
secure pseudo-random number generator (CSPRNG):

- `globalThis.crypto.getRandomValues` where available (browsers, Deno, Bun,
  edge runtimes, and modern Node).
- Node's `crypto.randomFillSync` as a fallback.

It never uses `Math.random()`. Characters are selected with rejection sampling
so the distribution is unbiased (no modulo bias).

## Reporting a vulnerability

If you believe you have found a security issue, please **do not** open a public
issue. Instead, report it privately via
[GitHub Security Advisories](https://github.com/your-username/prefid/security/advisories/new)
or by email to the maintainer. You will receive a response as soon as possible.

## Supported versions

The latest published version receives security fixes.
