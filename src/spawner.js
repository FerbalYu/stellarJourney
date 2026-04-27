/**
 * 敌人物品生成器
 * 根据地牢层数和房间类型放置敌人和物品
 */

import Enemy, { ENEMY_TYPES } from './enemy.js';
import { generateRandomLoot, generateBossLoot } from './items.js';

/**
 * 获取指定层数的可用敌人类型
 */
function getEnemyPool(level) {
  const pool = ['SLIME', 'RAT'];
  if (level >= 2) pool.push('BAT');
  if (level >= 3) pool.push('SKELETON');
  if (level >= 5) pool.push('ORC');
  return pool;
}

/**
 * 获取 Boss 类型
 */
function getBossType(level) {
  return 'BOSS_DRAGON';
}

/**
 * 在房间内放置敌人
 * @param {Array} rooms - 房间列表
 * @param {number[][]} map - 地牢地图
 * @param {number} level - 层数
 * @returns {Enemy[]}
 */
export function spawnEnemies(rooms, map, level) {
  const enemies = [];
  const pool = getEnemyPool(level);

  for (let i = 1; i < rooms.length; i++) {
    // 跳过第一个房间（起始房间）
    const room = rooms[i];
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 个敌人

    for (let j = 0; j < count; j++) {
      const pt = room.getRandomPoint();
      if (map[pt.y][pt.x] === 1) {
        // TILE.FLOOR
        const typeKey = pool[Math.floor(Math.random() * pool.length)];
        enemies.push(new Enemy(typeKey, pt.x, pt.y, level));
      }
    }

    // Boss 房间
    if (room.type === 'boss') {
      const pt = room.getCenter();
      enemies.push(new Enemy(getBossType(level), pt.x, pt.y, level));

      // Boss 周围小怪
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const nx = pt.x + dx;
        const ny = pt.y + dy;
        if (ny >= 0 && ny < map.length && nx >= 0 && nx < map[0].length && map[ny][nx] === 1) {
          const guardType = pool[Math.floor(Math.random() * pool.length)];
          enemies.push(new Enemy(guardType, nx, ny, level));
        }
      }
    }
  }

  return enemies;
}

/**
 * 在房间内放置物品
 * @param {Array} rooms
 * @param {number} level
 * @returns {Array} 物品数组 [{ item, x, y }]
 */
export function spawnItems(rooms, level) {
  const items = [];

  for (let i = 1; i < rooms.length; i++) {
    const room = rooms[i];

    if (room.type === 'boss') {
      const pt = room.getCenter();
      items.push({ item: generateBossLoot(), x: pt.x, y: pt.y });
      continue;
    }

    const isTreasure = room.type === 'treasure';
    const dropCount = isTreasure ? 3 : Math.random() < 0.4 ? 1 : 0;

    for (let j = 0; j < dropCount; j++) {
      const pt = room.getRandomPoint();
      items.push({
        item: generateRandomLoot(level, isTreasure),
        x: pt.x,
        y: pt.y,
      });
    }
  }

  return items;
}
