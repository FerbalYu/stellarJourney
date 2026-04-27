/**
 * 地下城生成器 - 主类
 */
import BSPNode from './bsp.js';
import CorridorGenerator from './corridor.js';
import Room from './room.js';

const TILE = {
  VOID: 0,
  FLOOR: 1,
  WALL: 2,
  DOOR: 3,
  CORRIDOR: 4,
  STAIRS_UP: 5,
  STAIRS_DOWN: 6,
};

class DungeonGenerator {
  constructor(options = {}) {
    this.width = options.width || 80;
    this.height = options.height || 60;
    this.minRoomSize = options.minRoomSize || 4;
    this.maxRoomSize = options.maxRoomSize || 12;
    this.bspDepth = options.bspDepth || 5;
    this.roomMargin = options.roomMargin || 2;
    this.corridorStyle = options.corridorStyle || 'simple';

    this.map = [];
    this.rooms = [];
    this.corridors = [];
    this.bspTree = null;
    this.level = options.level || 1;
  }

  // 初始化地图
  initMap() {
    this.map = [];
    for (let y = 0; y < this.height; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.map[y][x] = TILE.VOID;
      }
    }
  }

  // 生成地下城
  generate() {
    this.initMap();
    this.rooms = [];
    this.corridors = [];

    // 创建BSP树
    this.bspTree = new BSPNode(0, 0, this.width, this.height);
    this.bspTree.recursiveSplit(this.bspDepth, this.minRoomSize);

    // 在叶子节点生成房间
    const leaves = this.bspTree.getLeaves();
    for (const leaf of leaves) {
      this.createRoom(leaf);
    }

    // 连接房间
    this.connectRooms();

    // 添加墙壁
    this.addWalls();

    // 放置门
    this.placeDoors();

    // 放置楼梯
    this.placeStairs();

    // 设置特殊房间
    this.setupSpecialRooms();

    return {
      map: this.map,
      rooms: this.rooms,
      corridors: this.corridors,
      width: this.width,
      height: this.height,
      level: this.level,
      tileTypes: TILE,
    };
  }

  // 创建房间
  createRoom(node) {
    const rect = node.getRect();

    // 计算房间大小
    let roomWidth = Math.min(
      Math.floor(Math.random() * (this.maxRoomSize - this.minRoomSize)) + this.minRoomSize,
      rect.width - this.roomMargin * 2
    );
    let roomHeight = Math.min(
      Math.floor(Math.random() * (this.maxRoomSize - this.minRoomSize)) + this.minRoomSize,
      rect.height - this.roomMargin * 2
    );

    // 确保最小尺寸
    roomWidth = Math.max(roomWidth, this.minRoomSize);
    roomHeight = Math.max(roomHeight, this.minRoomSize);

    // 计算房间位置
    const roomX =
      rect.x +
      this.roomMargin +
      Math.floor(Math.random() * (rect.width - roomWidth - this.roomMargin * 2));
    const roomY =
      rect.y +
      this.roomMargin +
      Math.floor(Math.random() * (rect.height - roomHeight - this.roomMargin * 2));

    const room = new Room(roomX, roomY, roomWidth, roomHeight);
    node.room = room;
    this.rooms.push(room);

    // 绘制房间
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
          this.map[y][x] = TILE.FLOOR;
        }
      }
    }
  }

  // 连接所有房间
  connectRooms() {
    const corridorGen = new CorridorGenerator();

    // 使用最小生成树算法连接所有房间
    const connected = new Set();
    const unconnected = new Set(this.rooms);

    // 从第一个房间开始
    if (this.rooms.length > 0) {
      connected.add(this.rooms[0]);
      unconnected.delete(this.rooms[0]);
    }

    while (unconnected.size > 0) {
      let minDist = Infinity;
      let bestPair = null;

      // 找到最近的已连接和未连接房间对
      for (const connectedRoom of connected) {
        for (const unconnectedRoom of unconnected) {
          const c1 = connectedRoom.getCenter();
          const c2 = unconnectedRoom.getCenter();
          const dist = Math.abs(c1.x - c2.x) + Math.abs(c1.y - c2.y);

          if (dist < minDist) {
            minDist = dist;
            bestPair = { connected: connectedRoom, unconnected: unconnectedRoom };
          }
        }
      }

      if (bestPair) {
        const corridor = corridorGen.connectRooms(
          bestPair.connected,
          bestPair.unconnected,
          this.corridorStyle
        );
        this.corridors.push(corridor);

        // 绘制走廊
        for (const point of corridor) {
          if (point.x >= 0 && point.x < this.width && point.y >= 0 && point.y < this.height) {
            if (this.map[point.y][point.x] === TILE.VOID) {
              this.map[point.y][point.x] = TILE.CORRIDOR;
            }
          }
        }

        bestPair.unconnected.connected = true;
        connected.add(bestPair.unconnected);
        unconnected.delete(bestPair.unconnected);
      }
    }

    // 添加一些额外的随机连接以增加循环
    const extraConnections = Math.floor(this.rooms.length * 0.15);
    for (let i = 0; i < extraConnections; i++) {
      const room1 = this.rooms[Math.floor(Math.random() * this.rooms.length)];
      const room2 = this.rooms[Math.floor(Math.random() * this.rooms.length)];

      if (room1 !== room2) {
        const corridor = corridorGen.connectRooms(room1, room2, 'l');
        let newTiles = 0;

        for (const point of corridor) {
          if (point.x >= 0 && point.x < this.width && point.y >= 0 && point.y < this.height) {
            if (this.map[point.y][point.x] === TILE.VOID) {
              this.map[point.y][point.x] = TILE.CORRIDOR;
              newTiles++;
            }
          }
        }

        if (newTiles > 0) {
          this.corridors.push(corridor);
        }
      }
    }
  }

  // 添加墙壁
  addWalls() {
    const directions = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.map[y][x] === TILE.FLOOR || this.map[y][x] === TILE.CORRIDOR) {
          for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
              if (this.map[ny][nx] === TILE.VOID) {
                this.map[ny][nx] = TILE.WALL;
              }
            }
          }
        }
      }
    }
  }

  // 放置门
  placeDoors() {
    for (const room of this.rooms) {
      const bounds = room.getBounds();

      // 检查每个墙边
      for (let x = bounds.left; x <= bounds.right; x++) {
        // 上边
        if (bounds.top > 0 && this.map[bounds.top - 1][x] === TILE.CORRIDOR) {
          this.map[bounds.top][x] = TILE.DOOR;
          room.addDoor(x, bounds.top, 'up');
        }
        // 下边
        if (bounds.bottom < this.height - 1 && this.map[bounds.bottom + 1][x] === TILE.CORRIDOR) {
          this.map[bounds.bottom][x] = TILE.DOOR;
          room.addDoor(x, bounds.bottom, 'down');
        }
      }

      for (let y = bounds.top; y <= bounds.bottom; y++) {
        // 左边
        if (bounds.left > 0 && this.map[y][bounds.left - 1] === TILE.CORRIDOR) {
          this.map[y][bounds.left] = TILE.DOOR;
          room.addDoor(bounds.left, y, 'left');
        }
        // 右边
        if (bounds.right < this.width - 1 && this.map[y][bounds.right + 1] === TILE.CORRIDOR) {
          this.map[y][bounds.right] = TILE.DOOR;
          room.addDoor(bounds.right, y, 'right');
        }
      }
    }
  }

  // 放置楼梯
  placeStairs() {
    if (this.rooms.length < 2) return;

    // 楼梯向上 - 在第一个房间
    const startRoom = this.rooms[0];
    const upPoint = startRoom.getRandomPoint();
    this.map[upPoint.y][upPoint.x] = TILE.STAIRS_UP;

    // 楼梯向下 - 在最后一个房间
    const endRoom = this.rooms[this.rooms.length - 1];
    const downPoint = endRoom.getRandomPoint();
    this.map[downPoint.y][downPoint.x] = TILE.STAIRS_DOWN;
  }

  // 设置特殊房间
  setupSpecialRooms() {
    if (this.rooms.length < 3) return;

    // 设置起始房间
    this.rooms[0].type = 'start';

    // 设置出口房间（不一定是最远的，但通常在后面）
    this.rooms[this.rooms.length - 1].type = 'exit';

    // 根据等级放置特殊房间
    if (this.level % 5 === 0 && this.level > 0) {
      // Boss房间 - 每5层
      const bossRoom = this.rooms[Math.floor(this.rooms.length / 2)];
      bossRoom.type = 'boss';
    } else if (this.level % 3 === 0) {
      // 宝箱房间 - 每3层
      const treasureRoom = this.rooms[Math.floor(this.rooms.length / 2)];
      treasureRoom.type = 'treasure';
    }
  }

  // 获取地图数据
  getMap() {
    return this.map;
  }

  // 获取房间列表
  getRooms() {
    return this.rooms;
  }

  // 获取走廊列表
  getCorridors() {
    return this.corridors;
  }

  // 导出为可JSON序列化的格式
  toJSON() {
    return {
      width: this.width,
      height: this.height,
      level: this.level,
      map: this.map,
      rooms: this.rooms.map((r) => ({
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        type: r.type,
        doors: r.doors,
      })),
      corridors: this.corridors,
      tileTypes: TILE,
    };
  }
}

DungeonGenerator.TILE = TILE;

export default DungeonGenerator;
