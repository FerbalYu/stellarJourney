/**
 * 存档系统集成测试
 * 测试 save-system 模块
 */

import db from '../../src/database.js';
import saveSystem from '../../src/save-system.js';

describe('SaveSystem', () => {
  beforeEach(() => {
    db.clear();
  });

  const makeState = (overrides = {}) => ({
    level: 3,
    player: {
      level: 5,
      hp: 80,
      maxHp: 100,
      xp: 150,
      attack: 15,
      defense: 8,
      weapon: '長劍',
      armor: '皮甲',
      inventory: 4,
      position: { x: 10, y: 20 },
      facing: 'down',
    },
    running: true,
    gameOver: false,
    victory: false,
    mapSize: { w: 80, h: 60 },
    obstacleCount: 200,
    enemyCount: 12,
    itemCount: 5,
    ...overrides,
  });

  it('should save game state', () => {
    const result = saveSystem.save(makeState());
    expect(result.success).toBe(true);
    expect(result.slot).toBe(1);
  });

  it('should list saves', () => {
    saveSystem.save(makeState({ level: 1 }), 1);
    saveSystem.save(makeState({ level: 2 }), 2);
    const saves = saveSystem.listAll();
    expect(saves.length).toBe(5);
    expect(saves[0].name).toContain('第1層');
    expect(saves[1].name).toContain('第2層');
    expect(saves[2].empty).toBe(true);
  });

  it('should load saved game', () => {
    saveSystem.save(makeState({ level: 5 }), 1);
    const save = saveSystem.load(1);
    expect(save).not.toBeNull();
    expect(save.level).toBe(5);
    expect(save.playerSummary.level).toBe(5);
  });

  it('should delete save', () => {
    saveSystem.save(makeState(), 1);
    expect(saveSystem.hasSaves()).toBe(true);
    saveSystem.deleteSave(1);
    expect(saveSystem.hasSaves()).toBe(false);
  });

  it('should return null for empty slot', () => {
    expect(saveSystem.load(3)).toBeNull();
  });

  it('should track last save slot', () => {
    saveSystem.save(makeState(), 3);
    expect(saveSystem.getLastSlot()).toBe(3);
  });

  it('should auto-select empty slot', () => {
    saveSystem.save(makeState(), 1);
    saveSystem.save(makeState(), 2);
    const result = saveSystem.save(makeState());
    expect(result.slot).toBe(3);
  });

  it('should get stats', () => {
    saveSystem.save(makeState(), 1);
    saveSystem.save(makeState(), 2);
    const stats = saveSystem.getStats();
    expect(stats.total).toBe(2);
    expect(stats.slots).toEqual([1, 2]);
  });
});
