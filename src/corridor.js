/**
 * 走廊生成器 - 连接房间
 */
class CorridorGenerator {
  constructor() {
    this.corridors = [];
  }

  // 生成两个点之间的走廊
  createCorridor(start, end) {
    const corridor = [];
    let x = start.x;
    let y = start.y;

    // 随机选择先水平还是先垂直移动
    const horizontalFirst = Math.random() > 0.5;

    if (horizontalFirst) {
      // 水平移动
      while (x !== end.x) {
        corridor.push({ x, y });
        x += x < end.x ? 1 : -1;
      }
      // 垂直移动
      while (y !== end.y) {
        corridor.push({ x, y });
        y += y < end.y ? 1 : -1;
      }
    } else {
      // 垂直移动
      while (y !== end.y) {
        corridor.push({ x, y });
        y += y < end.y ? 1 : -1;
      }
      // 水平移动
      while (x !== end.x) {
        corridor.push({ x, y });
        x += x < end.x ? 1 : -1;
      }
    }

    corridor.push({ x, y });
    this.corridors.push(corridor);
    return corridor;
  }

  // 生成L型走廊
  createLCorridor(start, end) {
    const corridor = [];
    const midX = end.x;
    const midY = start.y;

    // 从起点到中间点
    let x = start.x;
    let y = start.y;
    while (x !== midX) {
      corridor.push({ x, y });
      x += x < midX ? 1 : -1;
    }
    while (y !== midY) {
      corridor.push({ x, y });
      y += y < midY ? 1 : -1;
    }

    // 从中间点到终点
    x = midX;
    y = midY;
    while (x !== end.x) {
      corridor.push({ x, y });
      x += x < end.x ? 1 : -1;
    }
    while (y !== end.y) {
      corridor.push({ x, y });
      y += y < end.y ? 1 : -1;
    }

    this.corridors.push(corridor);
    return corridor;
  }

  // 生成S型弯曲走廊
  createSCorridor(start, end, _mapWidth, _mapHeight) {
    const corridor = [];
    const midY1 = Math.floor(start.y + (end.y - start.y) * 0.33);
    const midY2 = Math.floor(start.y + (end.y - start.y) * 0.66);

    // 水平到第一个中间点
    let x = start.x;
    let y = start.y;
    while (x !== end.x) {
      corridor.push({ x, y });
      x += x < end.x ? 1 : -1;
    }
    while (y !== midY1) {
      corridor.push({ x, y });
      y += y < midY1 ? 1 : -1;
    }

    // 到第二个中间点
    while (x !== (end.x < start.x ? start.x : end.x) - 2) {
      corridor.push({ x, y });
      x += x < (end.x < start.x ? start.x : end.x) - 2 ? 1 : -1;
    }
    while (y !== midY2) {
      corridor.push({ x, y });
      y += y < midY2 ? 1 : -1;
    }

    // 到终点
    while (x !== end.x) {
      corridor.push({ x, y });
      x += x < end.x ? 1 : -1;
    }
    while (y !== end.y) {
      corridor.push({ x, y });
      y += y < end.y ? 1 : -1;
    }

    corridor.push({ x, y });
    this.corridors.push(corridor);
    return corridor;
  }

  // 创建连接两个房间的走廊
  connectRooms(room1, room2, style = 'simple') {
    const c1 = room1.getCenter();
    const c2 = room2.getCenter();

    switch (style) {
      case 'l':
        return this.createLCorridor(c1, c2);
      case 's':
        return this.createSCorridor(c1, c2, 100, 100);
      default:
        return this.createCorridor(c1, c2);
    }
  }

  // 获取所有走廊
  getCorridors() {
    return this.corridors;
  }

  // 获取所有走廊覆盖的坐标
  getAllCorridorTiles() {
    const tiles = new Set();
    for (const corridor of this.corridors) {
      for (const point of corridor) {
        tiles.add(`${point.x},${point.y}`);
      }
    }
    return tiles;
  }
}

export default CorridorGenerator;
