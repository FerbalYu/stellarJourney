# Architecture

## System Overview

"星際征途" is a roguelike dungeon crawler game with three major subsystems:

1. **Dungeon Generation** (core) — Procedurally generates multi-level dungeons
2. **Visibility System** (FOV) — Recursive shadowcasting and fog of war
3. **API / Troubleshoot** — Express server with troubleshoot API endpoints

## Component Map

```
┌─────────────────────────────────────────────┐
│                  Entry Points                │
│  src/index.js (app demo)                    │
│  src/server.js (Express API)                │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌───────┐ ┌────────┐ ┌──────────┐
│Config │ │Logger  │ │Validator │  ← Infrastructure (CommonJS)
└───────┘ └────────┘ └──────────┘
               │
    ┌──────────┼──────────────┐
    ▼          ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Dungeon  │ │   API    │ │  Visibility  │
│Generator │ │(trouble- │ │   (FOV)      │
│  (CJS)   │ │ shoot)   │ │   (ESM)      │
└──────────┘ └──────────┘ └──────────────┘
```

## Dungeon Generation Pipeline

```
Levels.js (multi-level orchestrator)
  └─► DungeonGenerator.generate()
        ├─► BSPNode.recursiveSplit()  → space partition tree
        ├─► createRoom(leaf)          → Room instances in leaves
        ├─► CorridorGenerator         → connect rooms (simple/L/S)
        ├─► addWalls()                → wall tiles around floors
        ├─► placeDoors()              → door tiles at corridor ends
        ├─► placeStairs()             → up/down stairs in rooms
        └─► setupSpecialRooms()       → boss/treasure rooms
```

### Key Classes

| Class | Role | File |
|-------|------|------|
| `BSPNode` | Binary space partition tree node | [bsp.js](../../src/bsp.js) |
| `Room` | Room with bounds/doors/center | [room.js](../../src/room.js) |
| `CorridorGenerator` | L-corridor, S-corridor, simple | [corridor.js](../../src/corridor.js) |
| `DungeonGenerator` | Orchestrates full generation | [dungeon.js](../../src/dungeon.js) |
| `DungeonLevel` | Single level data container | [levels.js](../../src/levels.js) |
| `DungeonProgression` | Multi-level generation and linking | [levels.js](../../src/levels.js) |

### Tile Types

Defined in [dungeon.js](../../src/dungeon.js):
- `VOID(0)`, `FLOOR(1)`, `WALL(2)`, `DOOR(3)`, `CORRIDOR(4)`, `STAIRS_UP(5)`, `STAIRS_DOWN(6)`

## Visibility System (FOV)

ES Module subsystem. Use `import`/`export`, not `require`.

```
Point.js ──────┐
Segment.js ────┤
               ├──► ShadowCaster.js ──► FogOfWar.js
types.js ──────┤
               └──► MemoryGrid.js ────┘
```

### Flow
1. `FogOfWar` manages the overall fog state
2. `ShadowCaster` computes visible area using recursive shadowcasting
3. `MemoryGrid` tracks explored but no-longer-visible tiles
4. `Segment`/`Point` are geometric primitives for ray calculations

## API Layer

| Route | Method | Description |
|-------|--------|-------------|
| `/api/troubleshoot/log` | POST | Log troubleshoot step completion |
| `/api/troubleshoot/complete` | POST | Mark troubleshoot as complete |
| `/api/troubleshoot/stats` | GET | Get troubleshooting statistics |
| `/api/game/version` | GET | Get current game version info |

## Data Flow

```
Browser (main-menu.js) ──► Express (server.js) ──► TroubleshootManager
                                                        │
                                                    Memory (Map)
```

## Module System Note

The project uses **two incompatible module systems**:
- `visibility/` → ES Modules (`import`/`export`)
- Everything else → CommonJS (`require`/`module.exports`)

DO NOT import visibility modules from CommonJS files (or vice versa) without a bundler (Webpack). The `visibility/` code is not currently integrated with the rest — it's a standalone subsystem.

## What's Missing

- No game loop / game state management
- No player/entity system
- No combat system
- No item/inventory system
- No input handling
- No save/load
- Database module (referenced by skipped tests)
- React/UI framework (ESLint configured for React but not installed)
