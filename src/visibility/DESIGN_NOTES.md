# Visibility Subsystem Design Notes

## Algorithm Choice: Recursive Shadowcasting

We use **Recursive Shadowcasting** (Bjorn Bergstrom, 2005) rather than:
- **Raycasting**: O(n²) — fires a ray to every perimeter cell. Good for small maps, blows up at 80×60.
- **Diamond Walls**: Simpler but less accurate at obstacle boundaries.

### How It Works

1. `collectKeyAngles()` — for every obstacle endpoint, compute the angle from the observer. Collect all unique angles + micro-offsets (±minAngleDelta).
2. Sort angles, iterate intervals. For each [angle1, angle2] wedge, cast a ray at the midpoint.
3. `castRay()` — find the closest obstacle intersection. If hit, mark the hit point as visible and start shadow recursion for that wedge.
4. Spiral outward through octants (0-7), tracking start/end slopes.

### Why 360 angular steps?

`angularSteps` determines the initial ray count around the observer. 360 means one ray per degree. Higher values = smoother visibility polygons. Lower = faster but blockier edges.

Default config in [types.js](../src/visibility/types.js):
- `viewRadius: 10` — most roguelikes use 8-12
- `shadowIterations: 2` — recursion depth for self-shadowing obstacles
- `interpolationSamples: 8` — smoothing between sampled rays

## Integration with Dungeon Generator

### Current Gap

`FogOfWar` expects `Segment[]` obstacles, but `dungeon.js` outputs a `map[y][x]` tile grid. Need a converter:

```js
function tilesToObstacles(map, width, height) {
  const obstacles = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (map[y][x] === TILE.WALL) {
        // Convert wall tile to 4 Segment edges
        obstacles.push(new Segment(new Point(x, y), new Point(x+1, y)));
        obstacles.push(new Segment(new Point(x+1, y), new Point(x+1, y+1)));
        obstacles.push(new Segment(new Point(x+1, y+1), new Point(x, y+1)));
        obstacles.push(new Segment(new Point(x, y+1), new Point(x, y)));
      }
    }
  }
  return obstacles;
}
```

### Performance Concern

80×60 dungeon → 4800 tiles → potentially 19200 segments if all walls. This is too many for shadowcasting. Solution:
- Pre-merge adjacent wall segments into longer line segments
- Only process obstacles within `viewRadius` of observer
- Cache obstacle geometry per level (doesn't change between turns)

## Known Limitations

1. **No diagonal vision blocking**: Walls are treated as 4-segment boxes, but diagonal gaps between corner-touching walls may allow vision to leak
2. **MemoryGrid decay** is linear (`maxMemoryDecay: 0.001`) — explored areas uniformly fade. A better model would use elapsed time or distance from observer
3. **FogOfWar.render()** is incomplete — `visibleColor` was removed because it was never used. The render method needs a full rewrite to properly layer VISIBLE/REMEMBERED/HIDDEN states on the canvas
4. **No performance profiling** — shadowcasting on 100×100 with 500 obstacles has unknown frame time

## Unused Code

- `ShadowCaster.js` lines 276-284: `p1`/`p2` boundary points for wedge visualization — computed but never used. Kept as reserved variables for future quad-tree spatial optimization.
