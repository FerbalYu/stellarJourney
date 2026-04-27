/**
 * 迷雾状态枚举
 */
export const FogState = {
  HIDDEN: 0, // 完全不可见
  REMEMBERED: 1, // 已探索但不在视野内
  VISIBLE: 2, // 当前可见
};

/**
 * 网格单元格状态
 */
export const CellState = {
  EMPTY: 0, // 空地
  WALL: 1, // 墙壁
  WATER: 2, // 水体
  DOOR: 3, // 门
  CHEST: 4, // 宝箱
  // 可扩展更多类型
};

/**
 * 视野模式
 */
export const VisionMode = {
  NORMAL: 'normal', // 普通视野
  DARKVISION: 'darkvision', // 黑暗视觉
  BLIND: 'blind', // 盲目
};

/**
 * 障碍物类型
 */
export const ObstacleType = {
  WALL: 'wall',
  DOOR: 'door',
  FURNITURE: 'furniture',
  CHARACTER: 'character',
};

/**
 * 创建默认配置
 */
export const DEFAULT_CONFIG = {
  viewRadius: 10, // 视野半径
  angularSteps: 360, // 角度采样数
  gridWidth: 100, // 网格宽度
  gridHeight: 100, // 网格高度
  cellSize: 1, // 单元格大小
  rayCount: 360, // 射线数量
  shadowIterations: 2, // 阴影递归迭代次数
  memoryDecay: 0.95, // 记忆衰减率
  minMemoryValue: 0.1, // 最小记忆值
  interpolationSamples: 8, // 插值采样数
};

export default {
  FogState,
  CellState,
  VisionMode,
  ObstacleType,
};
