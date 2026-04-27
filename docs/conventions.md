# Conventions

## Language

- **Source code comments**: Chinese (zh-CN)
- **Identifier names**: English (camelCase for variables/functions, PascalCase for classes)
- **Test descriptions**: Chinese

## Module System

**All source files use ES Module** (`import`/`export`). Configuration files use `.cjs` extension for CommonJS compatibility.

| Subsystem | Module System | Import Style |
|-----------|--------------|-------------|
| `src/` | ES Module | `import X from './x.js'` |
| `tests/` | ES Module (`.mjs` for standalone) | `import X from '../src/x.js'` |
| Config files (root) | CommonJS (`.cjs`) | `require('./x')` |

## Code Style (Prettier)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

Run `npx prettier --write "src/**/*.js"` before committing.

## Naming

- **Files**: kebab-case (`main-menu.js`, `FogOfWar.js` for classes)
- **Classes**: PascalCase (`DungeonGenerator`, `BSPNode`)
- **Functions/methods**: camelCase (`generateId`, `getCenter`)
- **Constants**: UPPER_SNAKE_CASE (`TILE.VOID`, `LOG_LEVELS`)
- **Private/unused**: Prefix with `_` (`_maxRatio`, `_unused`)

## Error Handling

- Use [logger.js](../src/logger.js) for all logging — never `console.log` directly
- `console.warn` and `console.error` are permitted for development
- API routes return structured JSON: `{ success: bool, error?: string, data?: any }`
- Validation functions return `ValidationResult` objects with `.isValid` and `.errors`

## File Organization

```
src/
├── module.js           # Module with a single exported class/function
├── ...
├── subdirectory/
│   ├── index.js        # Re-exports all sub-modules
│   └── Component.js    # Individual components
```

Every module file should have a JSDoc header comment describing its purpose.

## Imports Order (ESLint enforced)

1. Built-in Node modules (`path`, `crypto`)
2. External packages (`express`, `helmet`)
3. Internal modules (`./logger`, `./config`)

One empty line between groups, no empty lines within a group.

## Testing

- Framework tests use **Jest** with `describe`/`it`/`expect`
- Standalone tests use Node `assert` with a custom `test()` wrapper
- Test files live in `tests/` mirroring `src/` structure
- Test data fixtures live in `tests/fixtures/`
- All tests must pass before committing
