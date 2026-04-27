/**
 * 游戏集成测试
 * 测试 dungeon + FOV + tile-converter + 战斗 + 敌人 + 物品 集成
 */

import DungeonGenerator from '../src/dungeon.js';
import Enemy, { ENEMY_TYPES } from '../src/enemy.js';
import Player from '../src/player.js';
import { DIRECTION } from '../src/player.js';
import { tilesToObstacles, isBlocked } from '../src/tile-converter.js';
import FogOfWar from '../src/visibility/FogOfWar.js';
import { executeCombat, isAdjacent, calculateDamage } from '../src/combat.js';
import { spawnEnemies, spawnItems } from '../src/spawner.js';
import { generateRandomLoot, generateBossLoot, createItem, WEAPONS, ARMORS, POTIONS } from '../src/items.js';
import InputHandler from '../src/input-handler.js';

describe('Dungeon Generation', () => {
  let dungeon;

  beforeEach(() => {
    const generator = new DungeonGenerator({
      width: 80,
      height: 60,
      minRoomSize: 4,
      maxRoomSize: 10,
      bspDepth: 4,
    });
    dungeon = generator.generate();
  });

  it('should generate a valid map', () => {
    expect(dungeon.map).toBeDefined();
    expect(dungeon.width).toBe(80);
    expect(dungeon.height).toBe(60);
  });

  it('should generate at least 2 rooms', () => {
    expect(dungeon.rooms.length).toBeGreaterThanOrEqual(2);
  });

  it('should place stairs up and down', () => {
    let foundUp = false;
    let foundDown = false;
    for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
        if (dungeon.map[y][x] === 5) foundUp = true;
        if (dungeon.map[y][x] === 6) foundDown = true;
      }
    }
    expect(foundUp).toBe(true);
    expect(foundDown).toBe(true);
  });

  it('should have first room as start type', () => {
    expect(dungeon.rooms[0].type).toBe('start');
  });
});

describe('TileConverter', () => {
  it('should convert wall tiles to segments', () => {
    const map = [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 2, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ];
    const segments = tilesToObstacles(map, 5, 5, 1);
    expect(segments.length).toBe(4);
  });

  it('should produce segments from real dungeon', () => {
    const gen = new DungeonGenerator({ width: 50, height: 40, bspDepth: 3 });
    const d = gen.generate();
    const segments = tilesToObstacles(d.map, d.width, d.height, 1);
    expect(segments.length).toBeGreaterThan(0);
  });
});

describe('FogOfWar + Dungeon Integration', () => {
  it('should initialize FOV from dungeon obstacles', () => {
    const gen = new DungeonGenerator({ width: 50, height: 40, bspDepth: 3 });
    const d = gen.generate();
    const obstacles = tilesToObstacles(d.map, d.width, d.height, 1);

    const fog = new FogOfWar({ width: d.width, height: d.height, cellSize: 1 });
    for (const seg of obstacles) {
      fog.addObstacle(seg);
    }

    const center = d.rooms[0].getCenter();
    fog.setObserverPosition(center.x, center.y);
    expect(fog.getFogState(center.x, center.y)).toBe(2);
  });
});

describe('Player', () => {
  it('should create player at position', () => {
    const p = new Player(10, 20);
    expect(p.x).toBe(10);
    expect(p.isAlive()).toBe(true);
  });

  it('should move in valid direction', () => {
    const p = new Player(5, 5);
    expect(p.tryMove(DIRECTION.RIGHT, () => true)).toBe(true);
    expect(p.x).toBe(6);
  });

  it('should block movement on wall', () => {
    const p = new Player(5, 5);
    expect(p.tryMove(DIRECTION.DOWN, (x, y) => x !== 5 || y !== 6)).toBe(false);
  });

  it('should take damage correctly', () => {
    const p = new Player(0, 0);
    expect(p.takeDamage(30)).toBe(25);
    expect(p.hp).toBe(75);
  });

  it('should equip weapon and increase attack', () => {
    const p = new Player(0, 0);
    const baseAtk = p.getAttack();
    p.equip({ type: 'weapon', attack: 6, name: '測試劍' });
    expect(p.getAttack()).toBe(baseAtk + 6);
  });

  it('should equip armor and increase defense', () => {
    const p = new Player(0, 0);
    const baseDef = p.getDefense();
    p.equip({ type: 'armor', defense: 5, name: '測試甲' });
    expect(p.getDefense()).toBe(baseDef + 5);
  });

  it('should use potion and heal', () => {
    const p = new Player(0, 0);
    p.hp = 40;
    const healed = p.usePotion({ type: 'potion', heal: 25 });
    expect(healed).toBe(25);
    expect(p.hp).toBe(65);
  });
});

describe('Combat', () => {
  it('should calculate damage within range', () => {
    const result = calculateDamage({ attack: 10, defense: 0 }, { attack: 0, defense: 0 });
    if (!result.missed) {
      expect(result.damage).toBeGreaterThanOrEqual(1);
      expect(result.damage).toBeLessThanOrEqual(20);
    }
  });

  it('should execute full combat', () => {
    const p = new Player(5, 5);
    const e = new Enemy('SLIME', 5, 6, 1);
    const result = executeCombat(p, e, true);
    expect(result.logs.length).toBeGreaterThan(0);
  });

  it('should detect adjacent positions', () => {
    expect(isAdjacent({ x: 5, y: 5 }, { x: 6, y: 5 })).toBe(true);
    expect(isAdjacent({ x: 5, y: 5 }, { x: 5, y: 4 })).toBe(true);
    expect(isAdjacent({ x: 5, y: 5 }, { x: 6, y: 6 })).toBe(true);
    expect(isAdjacent({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(false);
    expect(isAdjacent({ x: 5, y: 5 }, { x: 10, y: 10 })).toBe(false);
  });
});

describe('Enemy', () => {
  it('should create enemy with correct type', () => {
    const e = new Enemy('SLIME', 3, 4, 1);
    expect(e.name).toBe('史萊姆');
    expect(e.x).toBe(3);
    expect(e.y).toBe(4);
    expect(e.isAlive()).toBe(true);
  });

  it('should scale with level', () => {
    const e1 = new Enemy('RAT', 0, 0, 1);
    const e10 = new Enemy('RAT', 0, 0, 10);
    expect(e10.maxHp).toBeGreaterThan(e1.maxHp);
  });

  it('should chase player within range', () => {
    const e = new Enemy('ORC', 3, 3, 1);
    const dir = e.getMove(5, 3, () => true, 8);
    expect(dir).not.toBeNull();
  });

  it('should take damage and die', () => {
    const e = new Enemy('SLIME', 0, 0, 1);
    e.takeDamage(999);
    expect(e.isAlive()).toBe(false);
  });
});

describe('Items', () => {
  it('should create item with id', () => {
    const item = createItem(WEAPONS.RUSTY_SWORD);
    expect(item.id).toBeDefined();
    expect(item.type).toBe('weapon');
  });

  it('should generate level-appropriate loot', () => {
    const loot = generateRandomLoot(1);
    expect(loot).not.toBeNull();
    expect(loot.name).toBeDefined();
  });

  it('should generate boss loot', () => {
    const loot = generateBossLoot();
    expect(loot).not.toBeNull();
  });
});

describe('Spawner', () => {
  it('should spawn enemies in rooms', () => {
    const gen = new DungeonGenerator({ width: 50, height: 40, bspDepth: 3 });
    const d = gen.generate();
    const enemies = spawnEnemies(d.rooms, d.map, 1);
    expect(enemies.length).toBeGreaterThan(0);
  });

  it('should spawn items in rooms', () => {
    const gen = new DungeonGenerator({ width: 50, height: 40, bspDepth: 3 });
    const d = gen.generate();
    const items = spawnItems(d.rooms, 1);
    expect(items.length).toBeGreaterThanOrEqual(0);
  });
});

describe('InputHandler', () => {
  it('should exist', () => {
    const ih = new InputHandler();
    expect(ih).toBeDefined();
  });
});
