/**
 * 多层地下城递进系统
 */
import DungeonGenerator from './dungeon.js';

class DungeonLevel {
  constructor(level, dungeonData) {
    this.level = level;
    this.dungeonData = dungeonData;
    this.parentLevel = null;
    this.childLevel = null;
  }

  getMap() {
    return this.dungeonData.map;
  }

  getRooms() {
    return this.dungeonData.rooms;
  }

  getCorridors() {
    return this.dungeonData.corridors;
  }

  getDifficulty() {
    return this.calculateDifficulty();
  }

  calculateDifficulty() {
    const baseDifficulty = this.level;
    const roomPenalty = this.dungeonData.rooms.length * 0.1;
    const sizeBonus = (this.dungeonData.width * this.dungeonData.height) / 1000;

    return Math.max(1, baseDifficulty - roomPenalty + sizeBonus);
  }

  isBossLevel() {
    return this.level % 5 === 0 && this.level > 0;
  }

  isTreasureLevel() {
    return this.level % 3 === 0 && !this.isBossLevel();
  }

  getLevelType() {
    if (this.isBossLevel()) return 'boss';
    if (this.isTreasureLevel()) return 'treasure';
    if (this.level === 1) return 'entry';
    return 'normal';
  }
}

class DungeonProgression {
  constructor(options = {}) {
    this.totalLevels = options.totalLevels || 10;
    this.width = options.width || 80;
    this.height = options.height || 60;
    this.levels = [];
    this.currentLevel = 0;
  }

  // 生成所有层
  generateAll() {
    this.levels = [];

    for (let i = 1; i <= this.totalLevels; i++) {
      const dungeon = this.generateLevel(i);
      this.levels.push(dungeon);
    }

    // 连接上下层楼梯
    this.linkLevels();

    return this.levels;
  }

  // 生成单层
  generateLevel(levelNum) {
    const options = this.getLevelOptions(levelNum);
    const generator = new DungeonGenerator(options);
    const dungeonData = generator.generate();

    return new DungeonLevel(levelNum, dungeonData);
  }

  // 获取层生成选项
  getLevelOptions(levelNum) {
    // 深层有更小的房间和更深的BSP分割
    const depthMultiplier = 1 + (levelNum - 1) * 0.1;

    return {
      width: this.width,
      height: this.height,
      minRoomSize: Math.max(3, Math.floor(4 / depthMultiplier)),
      maxRoomSize: Math.max(5, Math.floor(12 / depthMultiplier)),
      bspDepth: Math.min(7, Math.floor(5 + levelNum * 0.2)),
      roomMargin: Math.max(1, Math.floor(2 - levelNum * 0.05)),
      corridorStyle: levelNum > 5 ? 's' : levelNum > 2 ? 'l' : 'simple',
      level: levelNum,
    };
  }

  // 连接各层的楼梯
  linkLevels() {
    for (let i = 0; i < this.levels.length - 1; i++) {
      this.levels[i].childLevel = this.levels[i + 1];
      this.levels[i + 1].parentLevel = this.levels[i];
    }
  }

  // 获取当前层
  getCurrentLevel() {
    return this.levels[this.currentLevel];
  }

  // 向下移动
  descend() {
    if (this.currentLevel < this.levels.length - 1) {
      this.currentLevel++;
      return this.levels[this.currentLevel];
    }
    return null;
  }

  // 向上移动
  ascend() {
    if (this.currentLevel > 0) {
      this.currentLevel--;
      return this.levels[this.currentLevel];
    }
    return null;
  }

  // 获取所有层信息
  getAllLevelInfo() {
    return this.levels.map((level, index) => ({
      index,
      level: level.level,
      type: level.getLevelType(),
      difficulty: level.getDifficulty(),
      roomCount: level.getRooms().length,
      isBoss: level.isBossLevel(),
      isTreasure: level.isTreasureLevel(),
    }));
  }

  // 生成完整地下城的ASCII表示
  generateAsciiMap(levelNum) {
    if (levelNum < 1 || levelNum > this.levels.length) {
      return null;
    }

    const level = this.levels[levelNum - 1];
    const map = level.getMap();
    let ascii = '';

    const chars = {
      [DungeonGenerator.TILE.VOID]: ' ',
      [DungeonGenerator.TILE.FLOOR]: '.',
      [DungeonGenerator.TILE.WALL]: '#',
      [DungeonGenerator.TILE.DOOR]: '+',
      [DungeonGenerator.TILE.CORRIDOR]: ',',
      [DungeonGenerator.TILE.STAIRS_UP]: '<',
      [DungeonGenerator.TILE.STAIRS_DOWN]: '>',
    };

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        ascii += chars[map[y][x]] || '?';
      }
      ascii += '\n';
    }

    return ascii;
  }

  // 获取统计信息
  getStats() {
    let totalRooms = 0;
    let totalTiles = 0;
    let floorTiles = 0;

    for (const level of this.levels) {
      totalRooms += level.getRooms().length;
      const map = level.getMap();
      for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
          totalTiles++;
          if (map[y][x] !== DungeonGenerator.TILE.VOID) {
            floorTiles++;
          }
        }
      }
    }

    return {
      totalLevels: this.totalLevels,
      totalRooms,
      totalTiles,
      floorTiles,
      fillRate: ((floorTiles / totalTiles) * 100).toFixed(1) + '%',
    };
  }
}

export { DungeonProgression, DungeonLevel };
