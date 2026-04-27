import { FogState } from './types.js';

/**
 * 记忆网格 - 管理已探索区域的记忆
 */
class MemoryGrid {
  constructor(width, height, cellSize = 1) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);

    // 记忆数据: { cellKey: { state, lastSeen, seenCount, value } }
    this.cells = new Map();

    // 记忆配置
    this.config = {
      maxMemoryValue: 1.0,
      minMemoryValue: 0.0,
      decayRate: 0.001,
      fadeSpeed: 0.01,
    };
  }

  /**
   * 获取单元格的唯一键
   */
  getCellKey(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    return `${col},${row}`;
  }

  /**
   * 从坐标获取单元格信息
   */
  getCell(x, y) {
    const key = this.getCellKey(x, y);
    return this.cells.get(key) || null;
  }

  /**
   * 设置单元格数据
   */
  setCell(x, y, data) {
    const key = this.getCellKey(x, y);
    const now = Date.now();

    const existing = this.cells.get(key) || {
      state: FogState.HIDDEN,
      lastSeen: 0,
      seenCount: 0,
      value: this.config.minMemoryValue,
      content: null,
    };

    this.cells.set(key, {
      ...existing,
      ...data,
      lastSeen: now,
    });
  }

  /**
   * 标记区域为已探索
   */
  markExplored(x, y, content = null) {
    const key = this.getCellKey(x, y);
    const existing = this.cells.get(key);

    this.cells.set(key, {
      state: FogState.VISIBLE,
      lastSeen: Date.now(),
      seenCount: (existing?.seenCount || 0) + 1,
      value: this.config.maxMemoryValue,
      content: content || existing?.content,
    });
  }

  /**
   * 标记多个点为已探索
   */
  markAreaExplored(points, contentExtractor = null) {
    for (const point of points) {
      const x = point.x || point[0];
      const y = point.y || point[1];
      const content = contentExtractor ? contentExtractor(x, y) : null;
      this.markExplored(x, y, content);
    }
  }

  /**
   * 更新记忆值（随时间衰减）
   */
  updateMemory(deltaTime) {
    const decayAmount = this.config.decayRate * deltaTime;

    for (const [key, cell] of this.cells) {
      if (cell.state === FogState.VISIBLE) {
        // 当前可见区域不衰减
        continue;
      }

      if (cell.state === FogState.REMEMBERED || cell.value > this.config.minMemoryValue) {
        const newValue = Math.max(this.config.minMemoryValue, cell.value - decayAmount);

        this.cells.set(key, {
          ...cell,
          value: newValue,
          state: newValue > this.config.minMemoryValue ? FogState.REMEMBERED : FogState.HIDDEN,
        });
      }
    }
  }

  /**
   * 获取某点的迷雾状态
   */
  getFogState(x, y) {
    const cell = this.getCell(x, y);
    if (!cell) return FogState.HIDDEN;
    return cell.state;
  }

  /**
   * 获取记忆透明度（0-1）
   */
  getMemoryAlpha(x, y) {
    const cell = this.getCell(x, y);
    if (!cell) return 0;

    switch (cell.state) {
      case FogState.HIDDEN:
        return 0;
      case FogState.REMEMBERED:
        return cell.value * 0.5; // 记忆区域半透明
      case FogState.VISIBLE:
        return 1;
      default:
        return 0;
    }
  }

  /**
   * 获取网格数据用于渲染
   */
  getGridData() {
    const grid = [];

    for (let row = 0; row < this.rows; row++) {
      const rowData = [];
      for (let col = 0; col < this.cols; col++) {
        const key = `${col},${row}`;
        const cell = this.cells.get(key);

        rowData.push({
          x: col * this.cellSize,
          y: row * this.cellSize,
          fogState: cell?.state || FogState.HIDDEN,
          memoryValue: cell?.value || 0,
          content: cell?.content || null,
        });
      }
      grid.push(rowData);
    }

    return grid;
  }

  /**
   * 获取指定矩形区域的数据
   */
  getAreaData(minX, minY, maxX, maxY) {
    const data = [];

    for (let x = minX; x <= maxX; x += this.cellSize) {
      for (let y = minY; y <= maxY; y += this.cellSize) {
        const cell = this.getCell(x, y);
        if (cell) {
          data.push({
            x,
            y,
            fogState: cell.state,
            memoryValue: cell.value,
            content: cell.content,
          });
        }
      }
    }

    return data;
  }

  /**
   * 清除所有记忆
   */
  clear() {
    this.cells.clear();
  }

  /**
   * 清除未探索区域，但保留记忆
   */
  clearHiddenOnly() {
    for (const [key, cell] of this.cells) {
      if (cell.state === FogState.HIDDEN) {
        this.cells.delete(key);
      }
    }
  }

  /**
   * 设置记忆配置
   */
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取探索百分比
   */
  getExploredPercentage() {
    let explored = 0;
    let total = this.cols * this.rows;

    for (const cell of this.cells.values()) {
      if (cell.state !== FogState.HIDDEN) {
        explored++;
      }
    }

    return (explored / total) * 100;
  }

  /**
   * 序列化记忆数据
   */
  serialize() {
    return {
      width: this.width,
      height: this.height,
      cellSize: this.cellSize,
      cells: Array.from(this.cells.entries()),
    };
  }

  /**
   * 反序列化记忆数据
   */
  static deserialize(data) {
    const grid = new MemoryGrid(data.width, data.height, data.cellSize);
    grid.cells = new Map(data.cells);
    return grid;
  }
}

export default MemoryGrid;
