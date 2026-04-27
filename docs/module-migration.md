# CJS → ESM Migration Plan

## Current State

The project has two incompatible module systems:

| Directory | Module System | Count |
|-----------|--------------|-------|
| `src/visibility/` | ES Module (`import`/`export`) | 6 files |
| `src/` (everything else) | CommonJS (`require`/`module.exports`) | 11 files |
| `tests/` | CommonJS | 8 files |
| Config files | Both | `.eslintrc.js`, `jest.config.js` etc. |

## Why Migrate

1. **Tooling compatibility**: ESLint with `@typescript-eslint` works best with ESM
2. **Future-proof**: ESM is the JavaScript standard (Node 12+ fully supported)
3. **Tree-shaking**: Webpack can eliminate dead code from ESM imports
4. **Consistency**: Agents (and humans) shouldn't need to remember which directory uses which system
5. **TypeScript migration**: Blocked until module system is unified

## Migration Strategy: Gradual (Recommended)

**Phase 1: Convert src/ (CommonJS → ESM)** — 1-2 days

| File | Effort | Risk |
|------|--------|------|
| `src/index.js` | Low | Has `require.main === module` pattern, needs `import.meta` replacement |
| `src/server.js` | Low | No circular deps |
| `src/config.js` | Trivial | Pure data |
| `src/logger.js` | Low | Depends on config only |
| `src/utils.js` | Trivial | No internal deps |
| `src/validator.js` | Low | Depends on utils only |
| `src/bsp.js` | Trivial | No internal deps |
| `src/room.js` | Trivial | No internal deps |
| `src/corridor.js` | Trivial | No internal deps |
| `src/dungeon.js` | Low | Depends on bsp/room/corridor |
| `src/levels.js` | Low | Depends on dungeon |
| `src/troubleshoot/index.js` | Trivial | No internal deps |
| `src/troubleshoot/api.js` | Low | Depends on express, logger |
| `src/scripts/main-menu.js` | Low | Browser script, no module deps |

**Phase 2: Convert tests/** — 0.5 day

| File | Action |
|------|--------|
| `tests/index.runner.js` | `require` → `import` |
| `tests/troubleshoot.test.js` | May need `jest` ESM config |
| `tests/setup.js` | May need `.mjs` extension or `transform` |
| Jest config | Add `transform: {}` for native ESM or use `@jest/globals` |

**Phase 3: Convert config files**

| File | Action |
|------|--------|
| `webpack.config.js` | Already supports ESM via `module.exports` → `export default` |
| `.eslintrc.js` | Convert to `eslint.config.mjs` (flat config) |
| `jest.config.js` | Convert to `jest.config.mjs` |
| `babel.config.js` | Convert to `babel.config.mjs` |
| `ecosystem.config.js` | PM2 supports ESM |
| `scripts/deploy.sh` | N/A (shell) |

## Breaking Changes to Watch

### `require.main === module` → `import.meta`

```js
// Before (CJS)
if (require.main === module) { runDemo(); }

// After (ESM)
import { fileURLToPath } from 'node:url';
if (process.argv[1] === fileURLToPath(import.meta.url)) { runDemo(); }
```

### `__dirname` → `import.meta`

```js
// Before (CJS)
const path = require('path');
path.join(__dirname, '../public');

// After (ESM)
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
join(__dirname, '../public');
```

### Dynamic `require()` → Dynamic `import()`

```js
// Before
const module = require('./dynamic-module');

// After
const module = await import('./dynamic-module.js');
// Note: .js extension IS required in ESM
```

## Migration Checklist Per File

For each file being converted:

- [ ] Replace `const X = require('x')` with `import X from 'x'`
- [ ] Replace `module.exports = X` with `export default X`
- [ ] Replace `module.exports = { ... }` with `export { ... }`
- [ ] Add `.js` extension to all relative imports
- [ ] Replace `__dirname` with `import.meta.url` pattern
- [ ] Replace `require.main === module` with `import.meta.url` pattern
- [ ] Run `npx eslint` to verify no new errors
- [ ] Run `npx prettier --check` to verify formatting
- [ ] Run `npx jest` to verify tests still pass
- [ ] Run `node tests/index.runner.js` to verify standalone tests
- [ ] Run `npm run build` to verify webpack still bundles

## Webpack Considerations

Webpack 5 handles ESM natively. The `entry: './src/index.js'` config in [webpack.config.js](../webpack.config.js) will work unchanged — Webpack resolves `import`/`export` during bundling regardless of Node module system.

The `target` is browser by default, so `import.meta.url` patterns in `server.js` need `target: 'node'` or should be conditional.

## Decision Log

- **Date**: 2026-04-27
- **Decision**: Gradual migration (Phase 1→2→3), CJS→ESM everywhere
- **Rationale**: Unify module system, unblock TypeScript, improve tooling
- **Alternatives considered**:
  - Keep hybrid (rejected — ongoing maintenance cost)
  - Migrate visibility/ to CJS (rejected — CJS is legacy)
  - Big-bang rewrite (rejected — too risky, no test coverage)
- **Status**: Planned, not started
