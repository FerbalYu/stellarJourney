# ADR-002: BSP Dungeon Generation over Cellular Automata

## Status

Accepted

## Date

2026-04-27 (retroactively documented)

## Context

The dungeon generator needed an algorithm to create rooms and connect them into a playable map. Three common approaches were considered:

1. **BSP (Binary Space Partitioning)**: Recursively split space into sub-regions, place rooms in leaf nodes, connect adjacent siblings. Used by Brogue, Nethack.
2. **Cellular Automata**: Start with random noise, apply rules (e.g., Conway-like) to smooth into cave shapes. Used by Cogmind.
3. **Random Walk / Drunkard's Walk**: Randomly carve paths from a starting point. Produces very organic shapes but poor room definition.

## Decision

**Use BSP as the primary generation algorithm.**

Rationale:
1. **Connectivity guarantee**: BSP rooms are guaranteed to connect via corridor tree — no unreachable areas
2. **Controllable parameters**: Room sizes (`minRoomSize`/`maxRoomSize`), margin, split depth all tunable per level
3. **Natural hierarchical scaling**: Deeper BSP depth → more rooms → derived difficulty scaling (see `levels.js`)
4. **Well-understood**: BSP is the most documented and battle-tested roguelike map algorithm
5. **Room semantics**: BSP produces discrete rooms with clear identities (normal/treasure/boss/start/exit), enabling room-type specialization

## Consequences

**Positive:**
- All areas reachable from start to exit
- Predictable map structure for gameplay balancing
- Straightforward room→corridor→wall→door generation pipeline
- Easy to add special rooms (treasure, boss) in specific leaves

**Negative:**
- Maps can feel "boxy" — all rooms are rectangles
- Less organic than cellular automata caves
- Corridors are always orthogonal (no diagonal tunnels)
- Room placement depends on BSP splitting randomness, which can produce awkward layouts

## Alternatives Considered

1. **Cellular Automata** — Rejected for primary generation. Better suited for cave-like levels (side content, secret areas). Could be added as a secondary generator for special levels.
2. **Random Walk** — Rejected. No room guarantees, poor connectivity without post-processing.
3. **Prebuilt templates** — Rejected. Contradicts procedural generation goals. Could be used for boss rooms.

## Future

- Consider adding cellular automata as a secondary "cave level" generator for variety
- Explore Voronoi diagrams for more organic room shapes while maintaining BSP's connectivity guarantees
