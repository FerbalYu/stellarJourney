# 星際征途 (Stellar Journey)

## Quick Start

```bash
npm install
npm run dev          # Development (webpack-dev-server)
npm run dev:server   # Express API server
node tests/index.runner.mjs  # Standalone test runner
```

## Architecture Overview

3-tier roguelike game project with dungeon generation core and API layer.
See [docs/architecture.md](docs/architecture.md) for component relationships.

## Directory Structure

```
src/
├── index.js              # App entry point (ES Module)
├── server.js             # Express API server
├── config.js             # Application configuration
├── logger.js             # Structured logging
├── utils.js              # Utility functions (isEmpty, deepClone, etc.)
├── validator.js          # Input validation (ES Module)
├── bsp.js                # BSP tree for space partitioning
├── room.js               # Room class
├── corridor.js           # Corridor generator (3 styles)
├── dungeon.js            # Dungeon generator (main orchestrator)
├── levels.js             # Multi-level dungeon progression
├── scripts/              # Browser-side UI scripts
│   └── main-menu.js      # Main menu UI controller
├── styles/               # CSS styles
├── troubleshoot/         # Troubleshoot API module (ES Module)
│   ├── index.js          # TroubleshootManager class
│   └── api.js            # Express API routes
├── visibility/           # FOV/Fog-of-War system (ES Module)
│   ├── types.js          # Enums (FogState, CellState, etc.)
│   ├── Point.js          # 2D point class
│   ├── Segment.js        # Line segment class
│   ├── ShadowCaster.js   # Recursive shadowcasting
│   ├── FogOfWar.js       # Fog of war manager
│   └── MemoryGrid.js     # Explored area memory
└── index.html            # Main menu HTML

tests/
├── index.runner.mjs       # Standalone test runner (node tests/index.runner.mjs)
├── troubleshoot.test.js  # Jest: TroubleshootManager tests (17 tests)
├── setup.js              # Jest global setup
├── jest.config.js        # Jest configuration
├── fixtures/             # Static test data
├── utils/                # Test helpers
├── integration/          # Skipped: needs src/database
└── e2e/                  # Skipped: needs src/app

public/
└── index.html            # Troubleshoot tool HTML

docs/                     # Detailed documentation
├── architecture.md       # System design
├── conventions.md        # Coding standards
├── testing.md            # Test strategy
├── api.md                # API reference
├── data-model.md         # Type definitions and data structures
├── game-design.md        # Game mechanics and design
├── roadmap.md            # Feature roadmap by phase
├── module-migration.md   # CJS→ESM migration plan
└── decisions/            # Architecture Decision Records
    ├── 001-hybrid-module-system.md
    └── 002-bsp-over-cellular-automata.md
```

## Key Conventions

1. **Module system**: All source code uses ES Module (`import`/`export`). Configuration files use `.cjs` extension. DO NOT use `require()` in `src/` or `tests/`.
2. **Language**: All source code and comments in Chinese (zh-CN). Test descriptions in Chinese.
3. **Formatting**: Prettier with 2-space indent, single quotes, 100 char width. Run `npx prettier --write "src/**/*.js"` before committing.
4. **Linting**: ESLint with TypeScript parser (for better unused-variable detection). Run `npx eslint src --ext .js` before committing.
5. **No direct console**: Use [logger.js](src/logger.js) for logging. Only `console.warn`/`console.error` allowed.
6. **Tests required**: Every new module must have corresponding tests. Jest for framework tests, standalone runner for unit tests.

## Documentation Map

| Topic | File |
|-------|------|
| System architecture | [docs/architecture.md](docs/architecture.md) |
| Coding conventions | [docs/conventions.md](docs/conventions.md) |
| Testing strategy | [docs/testing.md](docs/testing.md) |
| API reference | [docs/api.md](docs/api.md) |
| Data models & types | [docs/data-model.md](docs/data-model.md) |
| Game design | [docs/game-design.md](docs/game-design.md) |
| Feature roadmap | [docs/roadmap.md](docs/roadmap.md) |
| CJS→ESM migration | [docs/module-migration.md](docs/module-migration.md) |
| Design rationale | [src/DESIGN_NOTES.md](src/DESIGN_NOTES.md) |
| Visibility (FOV) design | [src/visibility/DESIGN_NOTES.md](src/visibility/DESIGN_NOTES.md) |
| Frontend UI design | [src/scripts/DESIGN_NOTES.md](src/scripts/DESIGN_NOTES.md) |
| Architecture decisions | [docs/decisions/](docs/decisions/) |
| Live progress tracker | [progress.md](progress.md) |

## Common Tasks

| Task | Files / Commands |
|------|-----------------|
| Add dungeon generation feature | `src/dungeon.js` → `src/room.js`, `src/bsp.js`, `src/corridor.js` |
| Add new API endpoint | `src/server.js` + `src/troubleshoot/api.js` |
| Add visibility/FOV feature | `src/visibility/` (ESM!) |
| Run all tests | `npx jest` |
| Run standalone tests | `node tests/index.runner.mjs` |
| Build for production | `npm run build` |
| Lint check | `npx eslint src --ext .js` |
| Format check | `npx prettier --check "src/**/*.js"` |
