# Roadmap

## Status Key

- ✅ Done
- ⚠️ Incomplete / needs polish
- 🔲 Planned
- ❌ Won't do (decision deferred)

---

## Phase 1: Harness & Stabilization ✅

| Item | Status | Notes |
|------|--------|-------|
| Fix syntax error in types.js | ✅ | JSDoc comment missing `*/` |
| Fix ESLint configuration | ✅ | 1200→0 errors |
| Fix Prettier deprecated option | ✅ | `jsxBracketSameLine`→`bracketSameLine` |
| Fix test imports | ✅ | 28/28 standalone tests passing |
| Fix ghost dependencies in tests | ✅ | Skipped stubs for missing modules |
| Create AGENTS.md | ✅ | Entry point for AI agents |
| Create docs/ (architecture, conventions, testing) | ✅ | Full harness layer |
| Create DESIGN_NOTES.md | ✅ | Cross-session design memory |

---

## Phase 2: Documentation Completion 🔲

| Item | Status | Notes |
|------|--------|-------|
| Create docs/api.md | ✅ | Full API reference |
| Create docs/data-model.md | ✅ | All types, enums, interfaces |
| Create docs/game-design.md | ✅ | Core loop, room types, vision |
| Create docs/roadmap.md | 🔲 | This file |
| Create docs/module-migration.md | 🔲 | CJS→ESM migration plan |
| Create docs/decisions/ | 🔲 | Architecture Decision Records |
| Create progress.md | 🔲 | Live progress tracker |

---

## Phase 3: Module Unification 🔲

| Item | Status | Notes |
|------|--------|-------|
| Decide: keep troubleshoot or scrap | 🔲 | Currently unused in game |
| Create src/app.js (if keeping API) | 🔲 | Test files reference this |
| Migrate visibility/ to CommonJS OR rest to ESM | 🔲 | Pick one module system |
| Add tsconfig.json | 🔲 | TypeScript is installed but unused |
| Enable TypeScript strict mode | 🔲 | After adding tsconfig |

---

## Phase 4: Game Core 🔲

| Item | Status | Notes |
|------|--------|-------|
| Integrate FOV with dungeon map | 🔲 | Convert TILE.WALL→Segment obstacles |
| Create Player entity | 🔲 | Position, HP, stats, inventory |
| Create movement system | 🔲 | Arrow keys, collision with walls |
| Game loop (requestAnimationFrame) | 🔲 | Render→Input→Update→Repeat |
| Canvas rendering | 🔲 | Replace console output with visual map |
| Minimap | 🔲 | Top-right corner mini viewport |

---

## Phase 5: Gameplay Systems 🔲

| Item | Status | Notes |
|------|--------|-------|
| Enemy entities | 🔲 | Spawn in rooms, basic AI |
| Turn-based combat | 🔲 | Damage calculation, hit/miss |
| Item system | 🔲 | Weapons, armor, consumables |
| Inventory | 🔲 | UI + data model |
| Save/Load | 🔲 | Serialize game state to localStorage/JSON |
| Difficulty scaling | 🔲 | More enemies, stronger types per level |

---

## Phase 6: UI Polish 🔲

| Item | Status | Notes |
|------|--------|-------|
| HUD overlay | 🔲 | HP bar, level indicator, minimap |
| Message log | 🔲 | Combat log, exploration messages |
| Death screen | 🔲 | Stats recap, restart option |
| Victory screen | 🔲 | Floor 10 boss defeat |
| Sound effects | 🔲 | Web Audio API |
| Settings persistence | 🔲 | localStorage for volume/controls |

---

## Phase 7: Production 🔲

| Item | Status | Notes |
|------|--------|-------|
| Database integration | 🔲 | Implement src/database.js |
| Un-skip integration tests | 🔲 | Fill in database.test.js, api.test.js |
| Un-skip e2e tests | 🔲 | Fill in user-journey.test.js |
| CI/CD pipeline | 🔲 | Beyond deploy.yml, add test workflow |
| Bundle optimization | 🔲 | Code splitting, lazy load |
| Docker production image | 🔲 | Multi-stage build exists, needs tuning |

---

## Unscheduled / Backlog

| Item | Priority | Notes |
|------|----------|-------|
| Multiplayer co-op | Low | Shared dungeon instance |
| Level editor | Low | GUI for designing rooms |
| Mod support | Low | Load custom dungeon scripts |
| Mobile support | Low | Touch controls, responsive layout |
| WebSocket real-time | Low | Replace REST for game state sync |
