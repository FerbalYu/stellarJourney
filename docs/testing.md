# Testing Strategy

## Quick Commands

| Command | Purpose |
|---------|---------|
| `npx jest` | Run all Jest tests |
| `node tests/index.runner.mjs` | Run standalone unit tests |
| `npm test` | Same as `npx jest` |
| `npm run test:coverage` | Jest with coverage report |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:troubleshoot` | Run only troubleshoot tests |
| `npx eslint src --ext .js` | Lint check |
| `npx prettier --check "src/**/*.js"` | Format check |

## Test Structure

```
tests/
├── index.runner.mjs         # Standalone runner (not Jest) — 28 unit tests
├── troubleshoot.test.js    # Jest: TroubleshootManager (17 tests, ✅ all passing)
├── jest.config.js          # Jest configuration
├── setup.js                # Global Jest setup (env, matchers)
├── fixtures/
│   └── test-data.js        # Static test data
├── utils/
│   └── test-helpers.js     # generateTestUser, retry, wait, etc.
├── integration/
│   ├── api.test.js         # SKIPPED — needs src/app module
│   └── database.test.js    # SKIPPED — needs src/database module
└── e2e/
    ├── api-workflow.test.js # SKIPPED — needs src/app + src/database
    └── user-journey.test.js # SKIPPED — needs src/app + src/database
```

## Current Test Coverage

| Module | Status | Tests |
|--------|--------|-------|
| `utils.js` (isEmpty, deepClone, formatDate, etc.) | ✅ Passing | 18 |
| `validator.js` (validateString, validateNumber, validateObject) | ✅ Passing | 6 |
| `src/troubleshoot/` (TroubleshootManager) | ✅ Passing | 17 |
| `src/database` | ⛔ Skipped | Module not implemented |
| `src/app` | ⛔ Skipped | Module not implemented |

## Writing New Tests

### For utility/validator modules
Add tests to `tests/index.runner.js` using the `test()` helper:
```js
test('myFunction - description', () => {
  assert.strictEqual(myFunction(input), expectedOutput);
});
```

### For class/module tests
Create a new `tests/xxx.test.js` using Jest:
```js
const MyModule = require('../src/my-module');

describe('MyModule', () => {
  it('should do something', () => {
    expect(MyModule.doSomething()).toBe(expected);
  });
});
```

## Validation Pipeline

Before committing, run:
```bash
npx prettier --check "src/**/*.js" && npx eslint src --ext .js && npx jest && node tests/index.runner.mjs
```
All four must pass. The project currently has no pre-commit hook configured (husky install fails without git repo).

## Known Gaps

- No tests for dungeon generation (`bsp.js`, `room.js`, `corridor.js`, `dungeon.js`, `levels.js`)
- No tests for visibility system (`ShadowCaster.js`, `FogOfWar.js`, `MemoryGrid.js`)
- No tests for Express server (`server.js`)
- Integration/e2e tests are placeholder stubs — need `src/database` and `src/app` to be implemented first
- No CI pipeline configuration beyond the GitHub Actions deploy workflow
