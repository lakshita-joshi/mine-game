## Security / Dependency Audit

`npm audit` reports 20 high-severity findings, but they collapse to a **single
chain**: an outdated `brace-expansion` (DoS via unbounded expansion length)
pulled in transitively through `glob` → `minimatch` → Jest's internals
(`@jest/core`, `@jest/transform`, `jest-runtime`, etc.).

**Why this is low risk:**
- `jest` is a `devDependency` — it only runs locally via `npm test`. It is
  never bundled, deployed, or reachable by anyone hitting the live API.
- The vulnerable path has no code path into the Express server, the auth
  flow, the wallet service, or the provably-fair RNG.

**Why it isn't "fixed" via `npm audit fix --force`:**
- The suggested force-fix downgrades `jest` to `25.0.0` — a multi-major-version
  regression that would very likely break the existing test suite and
  reintroduce work rather than remove risk.

**Resolution applied:** pinned the vulnerable sub-dependency directly via
npm's `overrides` field, without touching Jest's version:

```json
{
  "overrides": {
    "brace-expansion": "^2.0.2"
  }
}
```

After adding this to `package.json`, run `npm install` again and re-check with
`npm audit` — this forces every nested copy of `brace-expansion` (including
the ones under Jest) to resolve to the patched version.