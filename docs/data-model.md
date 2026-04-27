# Data Model

## Dungeon Map

### Tile Types

Defined in [dungeon.js](../src/dungeon.js). 2D grid: `map[y][x]` = tile type constant.

| Constant | Value | Meaning | Appearance |
|----------|-------|---------|------------|
| `TILE.VOID` | 0 | Empty/uninitialized cell | Black |
| `TILE.FLOOR` | 1 | Walkable floor | Light gray |
| `TILE.WALL` | 2 | Impassable wall | Dark gray |
| `TILE.DOOR` | 3 | Door between room and corridor | Brown |
| `TILE.CORRIDOR` | 4 | Corridor floor | Medium gray |
| `TILE.STAIRS_UP` | 5 | Stairs to previous level | Green |
| `TILE.STAIRS_DOWN` | 6 | Stairs to next level | Red |

### Room

```typescript
interface Room {
  x: number;          // top-left x in map coordinates
  y: number;          // top-left y in map coordinates
  width: number;      // interior width (cells)
  height: number;     // interior height (cells)
  doors: Door[];      // door entries
  connected: boolean; // linked to at least one other room
  type: 'normal' | 'treasure' | 'boss' | 'start' | 'exit';
}
```

```typescript
interface Door {
  x: number;
  y: number;
  direction: string;
}
```

### Corridor

Array of `{ x, y }` points forming a path between two rooms.

### DungeonGenerator Output

```typescript
interface DungeonData {
  map: number[][];        // 2D tile grid: map[y][x]
  rooms: Room[];
  corridors: Point[][];   // array of corridor paths
  width: number;
  height: number;
  level: number;          // floor number (1-based)
  tileTypes: typeof TILE;
}
```

---

## Dungeon Progression

### DungeonLevel

```typescript
interface DungeonLevel {
  level: number;                // 1-based floor number
  dungeonData: DungeonData;     // generated map data
  parentLevel: DungeonLevel | null;
  childLevel: DungeonLevel | null;
}
```

### Level Types

| Type | Condition | Properties |
|------|-----------|------------|
| `entry` | level === 1 | Start floor |
| `treasure` | level % 3 === 0, not boss | Extra loot |
| `boss` | level % 5 === 0, level > 0 | Boss encounter |
| `normal` | otherwise | Standard floor |

### Level Scaling

As `levelNum` increases:
- `minRoomSize` decreases (minimum 3)
- `maxRoomSize` decreases (minimum 5)
- `bspDepth` increases (maximum 7)
- `roomMargin` decreases (minimum 1)
- `corridorStyle` changes: level 1-2→`simple`, 3-5→`l`, 6+→`s`

---

## Visibility System

### Enums

| Enum | Values | File |
|------|--------|------|
| `FogState` | `HIDDEN(0)`, `REMEMBERED(1)`, `VISIBLE(2)` | [types.js](../src/visibility/types.js) |
| `CellState` | `EMPTY(0)`, `WALL(1)`, `WATER(2)`, `DOOR(3)`, `CHEST(4)` | [types.js](../src/visibility/types.js) |
| `VisionMode` | `NORMAL`, `DARKVISION`, `BLIND` | [types.js](../src/visibility/types.js) |
| `ObstacleType` | `WALL`, `DOOR`, `FURNITURE`, `CHARACTER` | [types.js](../src/visibility/types.js) |

### FogOfWar Configuration

```typescript
interface FogConfig {
  width: number;              // grid width (default 100)
  height: number;             // grid height (default 100)
  cellSize: number;           // cell pixel size (default 1)
  viewRadius: number;         // vision radius (default 10)
  angularSteps: number;       // ray angle steps (default 360)
  shadowIterations: number;   // recursion depth (default 2)
  interpolationSamples: number; // smoothing samples (default 8)
  maxMemoryDecay: number;     // memory fade rate (default 0.001)
  minExploredAlpha: number;   // minimum opacity (default 0.3)
}
```

### Visibility Output

```typescript
interface VisibilityResult {
  segments: Segment[];   // visible edge segments
  points: Point[];       // visible endpoint set
  shadows: ShadowRange[]; // blocked angle ranges
}
```

---

## Troubleshoot System

### Step Configuration

| Step ID | Title | Key | Required |
|---------|-------|-----|----------|
| 1 | 重启设备 | `restartDevice` | Yes |
| 2 | 清除缓存 | `clearCache` | No |
| 3 | 切换网络 | `switchNetwork` | No |
| 4 | 更新版本 | `updateVersion` | Yes |

### User State (In-Memory)

```typescript
Map<string, number>  // userId → currentStep (1-4)
```

### API Statistics (In-Memory)

```typescript
interface TroubleshootStats {
  totalRequests: number;
  stepCompletions: { 1: number; 2: number; 3: number; 4: number };
  completedTroubleshootings: number;
}
```

### TroubleshootLog Entry

```typescript
interface TroubleshootLog {
  step: number;       // 1-4
  timestamp: string;  // ISO 8601
  completed: true;
}
```

---

## Application Config

```typescript
interface AppConfig {
  app: {
    name: string;        // default: 'Basic Functionality'
    version: string;     // default: '1.0.0'
    environment: string; // from NODE_ENV
    port: number;        // from PORT, default 3000
  };
  logger: {
    level: 'error' | 'warn' | 'info' | 'debug';
    enableConsole: boolean;
  };
  features: {
    enableCache: boolean;
    enableValidation: boolean;
    enableErrorHandling: boolean;
  };
}
```

Note: `features` flags are defined but never consumed anywhere in the codebase.
