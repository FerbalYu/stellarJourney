/**
 * 地牢地图 → 视野障碍物转换器
 * 将 dungeon.js 的 TILE 网格转换为 visibility/ 的 Segment 障碍物
 */

import Point from './visibility/Point.js';
import Segment from './visibility/Segment.js';

const WALL = 2;

/**
 * 将地牢瓦片地图转换为 FOV 障碍物线段列表
 * 对相邻墙壁进行线段合并以减少障碍物数量，优化阴影投射性能
 *
 * @param {number[][]} map - 2D 瓦片网格 map[y][x]
 * @param {number} width - 地图宽度
 * @param {number} height - 地图高度
 * @param {number} cellSize - 单元格像素大小 (默认 1)
 * @returns {Segment[]} 障碍物线段数组
 */
export function tilesToObstacles(map, width, height, cellSize = 1) {
  const obstacles = [];
  const visited = new Set();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (map[y][x] !== WALL) continue;

      const key = `${x},${y}`;
      if (visited.has(key)) continue;

      // 水平合并
      let endX = x;
      while (endX + 1 < width && map[y][endX + 1] === WALL && !visited.has(`${endX + 1},${y}`)) {
        endX++;
      }

      if (endX > x) {
        for (let ix = x; ix <= endX; ix++) {
          visited.add(`${ix},${y}`);
        }

        // 上边
        if (y === 0 || map[y - 1][x] !== WALL) {
          obstacles.push(
            new Segment(
              new Point(x * cellSize, y * cellSize),
              new Point((endX + 1) * cellSize, y * cellSize)
            )
          );
        }
        // 下边
        if (y + 1 >= height || map[y + 1][x] !== WALL) {
          obstacles.push(
            new Segment(
              new Point((endX + 1) * cellSize, (y + 1) * cellSize),
              new Point(x * cellSize, (y + 1) * cellSize)
            )
          );
        }
      }
    }
  }

  // 垂直边处理（未合并的孤立墙块）
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (map[y][x] !== WALL) continue;

      // 左边
      if (x === 0 || map[y][x - 1] !== WALL) {
        let endY = y;
        while (endY + 1 < height && map[endY + 1][x] === WALL) {
          if (x > 0 && map[endY + 1][x - 1] === WALL) break;
          endY++;
        }
        if (endY > y) {
          obstacles.push(
            new Segment(
              new Point(x * cellSize, (endY + 1) * cellSize),
              new Point(x * cellSize, y * cellSize)
            )
          );
        }
      }

      // 右边
      if (x + 1 >= width || map[y][x + 1] !== WALL) {
        let endY = y;
        while (endY + 1 < height && map[endY + 1][x] === WALL) {
          if (x + 1 < width && map[endY + 1][x + 1] === WALL) break;
          endY++;
        }
        if (endY > y) {
          obstacles.push(
            new Segment(
              new Point((x + 1) * cellSize, y * cellSize),
              new Point((x + 1) * cellSize, (endY + 1) * cellSize)
            )
          );
        }
      }

      // 孤立 1x1 墙块
      const isIsolated =
        (x === 0 || map[y][x - 1] !== WALL) &&
        (x + 1 >= width || map[y][x + 1] !== WALL) &&
        (y === 0 || map[y - 1][x] !== WALL) &&
        (y + 1 >= height || map[y + 1][x] !== WALL);

      if (isIsolated) {
        const sx = x * cellSize;
        const sy = y * cellSize;
        const ex = (x + 1) * cellSize;
        const ey = (y + 1) * cellSize;
        obstacles.push(new Segment(new Point(sx, sy), new Point(ex, sy)));
        obstacles.push(new Segment(new Point(ex, sy), new Point(ex, ey)));
        obstacles.push(new Segment(new Point(ex, ey), new Point(sx, ey)));
        obstacles.push(new Segment(new Point(sx, ey), new Point(sx, sy)));
      }
    }
  }

  return obstacles;
}

/**
 * 获取指定位置是否阻塞视线
 * @param {number[][]} map - 地牢地图
 * @param {number} x - 格子x坐标
 * @param {number} y - 格子y坐标
 * @returns {boolean}
 */
export function isBlocked(map, x, y) {
  if (x < 0 || y < 0 || y >= map.length || x >= map[0].length) return true;
  return map[y][x] === WALL;
}
