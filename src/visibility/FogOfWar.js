import MemoryGrid from './MemoryGrid.js';
import Point from './Point.js';
import Segment from './Segment.js';
import ShadowCaster from './ShadowCaster.js';
import { FogState, VisionMode } from './types.js';

/**
 * 迷雾系统 - 管理视野和迷雾效果
 */
class FogOfWar {
  constructor(config = {}) {
    this.config = {
      width: config.width || 100,
      height: config.height || 100,
      cellSize: config.cellSize || 1,
      viewRadius: config.viewRadius || 10,
      angularSteps: config.angularSteps || 360,
      shadowIterations: config.shadowIterations || 2,
      interpolationSamples: config.interpolationSamples || 8,
      maxMemoryDecay: config.maxMemoryDecay || 0.001,
      minExploredAlpha: config.minExploredAlpha || 0.3,
      ...config,
    };

    // 初始化组件
    this.shadowCaster = new ShadowCaster({
      viewRadius: this.config.viewRadius,
      angularSteps: this.config.angularSteps,
      shadowIterations: this.config.shadowIterations,
      interpolationSamples: this.config.interpolationSamples,
      tileSize: this.config.cellSize,
    });

    this.memoryGrid = new MemoryGrid(this.config.width, this.config.height, this.config.cellSize);

    // 观察者状态
    this.observer = {
      position: new Point(0, 0),
      direction: 0, // 朝向角度
      visionMode: VisionMode.NORMAL,
      viewRadius: this.config.viewRadius,
    };

    // 障碍物数据
    this.obstacles = [];
    this.wallSegments = [];
    this.blockingTiles = new Set();

    // 当前帧的可见区域
    this.currentlyVisible = new Set();
    this.visibilityPolygons = [];

    // 事件回调
    this.onVisibilityChange = null;
    this.onTileExplored = null;
  }

  /**
   * 设置观察者位置
   */
  setObserverPosition(x, y) {
    this.observer.position = new Point(x, y);
    this.updateVisibility();
  }

  /**
   * 设置观察者朝向
   */
  setObserverDirection(angle) {
    this.observer.direction = angle;
    this.updateVisibility();
  }

  /**
   * 设置视野半径
   */
  setViewRadius(radius) {
    this.observer.viewRadius = radius;
    this.shadowCaster.viewRadius = radius;
    this.updateVisibility();
  }

  /**
   * 设置视野模式
   */
  setVisionMode(mode) {
    this.observer.visionMode = mode;
    this.updateVisibility();
  }

  /**
   * 添加障碍物线段
   */
  addObstacle(segment) {
    if (segment instanceof Segment) {
      this.obstacles.push(segment);
      this.wallSegments.push(segment);
    } else {
      const seg = new Segment(segment.p1, segment.p2, segment.obstacle);
      this.obstacles.push(seg);
      this.wallSegments.push(seg);
    }
  }

  /**
   * 添加矩形障碍物
   */
  addRectObstacle(x, y, width, height, obstacleData = null) {
    const corners = [
      new Point(x, y),
      new Point(x + width, y),
      new Point(x + width, y + height),
      new Point(x, y + height),
    ];

    // 创建四条边
    for (let i = 0; i < 4; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 4];
      this.addObstacle(new Segment(p1, p2, obstacleData));
    }

    // 标记内部为阻挡
    for (let dx = 0; dx < width; dx += this.config.cellSize) {
      for (let dy = 0; dy < height; dy += this.config.cellSize) {
        this.blockingTiles.add(this.getTileKey(x + dx, y + dy));
      }
    }
  }

  /**
   * 清除所有障碍物
   */
  clearObstacles() {
    this.obstacles = [];
    this.wallSegments = [];
    this.blockingTiles.clear();
  }

  /**
   * 获取Tile键
   */
  getTileKey(x, y) {
    return `${Math.floor(x / this.config.cellSize)},${Math.floor(y / this.config.cellSize)}`;
  }

  /**
   * 检测某点是否被阻挡
   */
  isBlocking(x, y) {
    const key = this.getTileKey(x, y);
    return this.blockingTiles.has(key);
  }

  /**
   * 检测点是否在视野范围内
   */
  isInViewRange(x, y) {
    const dist = this.observer.position.distanceTo(new Point(x, y));
    return dist <= this.observer.viewRadius;
  }

  /**
   * 更新可见性
   */
  updateVisibility() {
    const origin = this.observer.position;

    // 保存之前的可见区域
    const previousVisible = new Set(this.currentlyVisible);

    // 计算新的可见区域
    let result;

    if (this.observer.visionMode === VisionMode.BLIND) {
      // 盲目模式：只能看到自己
      this.currentlyVisible.clear();
      this.currentlyVisible.add(`${origin.x},${origin.y}`);
      result = { segments: [], points: [origin], polygons: [] };
    } else {
      // 正常/黑暗视觉模式
      result = this.shadowCaster.computeVisibility(origin, this.obstacles, (point) =>
        this.isBlocking(point.x, point.y)
      );

      this.currentlyVisible.clear();

      // 收集所有可见点
      for (const point of result.points) {
        this.currentlyVisible.add(`${point.x},${point.y}`);
      }

      // 添加观察者位置
      this.currentlyVisible.add(`${origin.x},${origin.y}`);
    }

    // 更新记忆网格
    this.updateMemory();

    // 存储可见多边形
    this.visibilityPolygons = this.shadowCaster.computeVisibilityFan(origin, this.obstacles);

    // 触发事件
    if (this.onVisibilityChange) {
      const newVisible = this.getVisibleTiles();
      const oldVisible = Array.from(previousVisible).map((k) => {
        const [x, y] = k.split(',').map(Number);
        return { x, y };
      });
      this.onVisibilityChange(newVisible, oldVisible);
    }
  }

  /**
   * 更新记忆
   */
  updateMemory() {
    // 将当前可见区域标记为已探索
    for (const key of this.currentlyVisible) {
      const [x, y] = key.split(',').map(Number);
      this.memoryGrid.markExplored(x, y);
    }

    // 触发探索事件
    if (this.onTileExplored) {
      const newlyExplored = [];
      for (const key of this.currentlyVisible) {
        const [x, y] = key.split(',').map(Number);
        const cell = this.memoryGrid.getCell(x, y);
        if (cell && cell.seenCount === 1) {
          newlyExplored.push({ x, y, content: cell.content });
        }
      }
      if (newlyExplored.length > 0) {
        this.onTileExplored(newlyExplored);
      }
    }
  }

  /**
   * 获取当前可见的瓦片列表
   */
  getVisibleTiles() {
    const tiles = [];
    for (const key of this.currentlyVisible) {
      const [x, y] = key.split(',').map(Number);

      // 检查是否在有效范围内
      if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
        tiles.push({ x, y });
      }
    }
    return tiles;
  }

  /**
   * 获取某点的迷雾状态
   */
  getFogState(x, y) {
    const key = `${x},${y}`;

    // 检查是否当前可见
    if (this.currentlyVisible.has(key)) {
      return FogState.VISIBLE;
    }

    // 检查记忆
    return this.memoryGrid.getFogState(x, y);
  }

  /**
   * 获取某点的透明度
   */
  getAlpha(x, y) {
    const state = this.getFogState(x, y);

    switch (state) {
      case FogState.VISIBLE:
        return 1.0;
      case FogState.REMEMBERED:
        return this.memoryGrid.getMemoryAlpha(x, y);
      case FogState.HIDDEN:
      default:
        return 0;
    }
  }

  /**
   * 更新（每帧调用）
   */
  update(deltaTime) {
    this.memoryGrid.updateMemory(deltaTime);
  }

  /**
   * 获取完整的迷雾数据
   */
  getFogData() {
    const tiles = [];

    for (let x = 0; x < this.config.width; x += this.config.cellSize) {
      for (let y = 0; y < this.config.height; y += this.config.cellSize) {
        tiles.push({
          x,
          y,
          state: this.getFogState(x, y),
          alpha: this.getAlpha(x, y),
          isVisible: this.currentlyVisible.has(`${x},${y}`),
        });
      }
    }

    return {
      tiles,
      visibilityPolygons: this.visibilityPolygons,
      observer: {
        position: this.observer.position,
        direction: this.observer.direction,
        viewRadius: this.observer.viewRadius,
      },
    };
  }

  /**
   * 渲染到Canvas
   */
  render(ctx, options = {}) {
    const {
      hiddenColor = 'rgba(0, 0, 0, 1)',
      rememberedColor = 'rgba(0, 0, 0, 0.7)',
      showMemoryBorders = false,
      memoryBorderColor = 'rgba(255, 255, 255, 0.1)',
    } = options;

    const cellSize = this.config.cellSize;

    // 渲染每个瓦片
    for (let x = 0; x < this.config.width; x += cellSize) {
      for (let y = 0; y < this.config.height; y += cellSize) {
        const state = this.getFogState(x, y);
        const alpha = this.getAlpha(x, y);

        if (state === FogState.HIDDEN) {
          ctx.fillStyle = hiddenColor;
          ctx.fillRect(x, y, cellSize, cellSize);
          continue;
        }

        if (alpha < 1) {
          ctx.fillStyle = rememberedColor.replace(/[\d.]+\)$/, `${alpha})`);
          ctx.fillRect(x, y, cellSize, cellSize);
        }

        // 可选：显示记忆边界
        if (showMemoryBorders && state === FogState.REMEMBERED) {
          ctx.strokeStyle = memoryBorderColor;
          ctx.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }
  }

  /**
   * 获取探索百分比
   */
  getExploredPercentage() {
    return this.memoryGrid.getExploredPercentage();
  }

  /**
   * 清除所有记忆
   */
  reset() {
    this.memoryGrid.clear();
    this.currentlyVisible.clear();
    this.updateVisibility();
  }

  /**
   * 序列化
   */
  serialize() {
    return {
      config: this.config,
      observer: {
        position: { x: this.observer.position.x, y: this.observer.position.y },
        direction: this.observer.direction,
        visionMode: this.observer.visionMode,
        viewRadius: this.observer.viewRadius,
      },
      obstacles: this.obstacles.map((s) => ({
        p1: { x: s.p1.x, y: s.p1.y },
        p2: { x: s.p2.x, y: s.p2.y },
        obstacle: s.obstacle,
      })),
      memory: this.memoryGrid.serialize(),
    };
  }

  /**
   * 反序列化
   */
  static deserialize(data) {
    const fog = new FogOfWar(data.config);

    fog.observer.position = new Point(data.observer.position.x, data.observer.position.y);
    fog.observer.direction = data.observer.direction;
    fog.observer.visionMode = data.observer.visionMode;
    fog.observer.viewRadius = data.observer.viewRadius;

    fog.obstacles = data.obstacles.map(
      (s) => new Segment(new Point(s.p1.x, s.p1.y), new Point(s.p2.x, s.p2.y), s.obstacle)
    );
    fog.wallSegments = [...fog.obstacles];

    fog.memoryGrid = MemoryGrid.deserialize(data.memory);
    fog.updateVisibility();

    return fog;
  }
}

export default FogOfWar;
