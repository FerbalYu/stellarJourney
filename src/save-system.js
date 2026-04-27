/**
 * 存档管理系统
 * 序列化/反序列化游戏状态，支持多个存档槽位
 */

import db from './database.js';
import settings from './settings.js';

const SAVE_COLLECTION = 'saves';
const MAX_SLOTS = 5;

class SaveSystem {
  /**
   * 保存游戏
   * @param {Object} gameState - game.getState()
   * @param {number} slot - 存档槽位 (1-5)，默认自动选择空槽
   * @returns {Object} { success, slot, name }
   */
  save(gameState, slot = null) {
    if (!gameState || !gameState.player) {
      return { success: false, error: '无效的游戏状态' };
    }

    const existing = db.findAll(SAVE_COLLECTION);

    if (slot !== null) {
      // 覆盖指定槽位
      const existingSave = db.findByField(SAVE_COLLECTION, 'slot', slot);
      if (existingSave) {
        db.delete(SAVE_COLLECTION, existingSave.id);
      }
    } else {
      // 自动选择空槽
      const usedSlots = new Set(existing.map((s) => s.slot));
      slot = 1;
      while (usedSlots.has(slot) && slot <= MAX_SLOTS) {
        slot++;
      }
      if (slot > MAX_SLOTS) {
        return { success: false, error: '所有存档槽位已满' };
      }
    }

    const player = gameState.player;
    const saveName = `第${gameState.level}層 LV${player.level} ${player.weapon}`;

    db.create(SAVE_COLLECTION, {
      slot,
      name: saveName,
      level: gameState.level,
      playerSummary: {
        level: player.level,
        hp: player.hp,
        maxHp: player.maxHp,
        xp: player.xp,
        attack: player.attack,
        defense: player.defense,
        weapon: player.weapon,
        armor: player.armor,
        inventory: player.inventory,
      },
      state: {
        level: gameState.level,
        running: gameState.running,
        mapSize: gameState.mapSize,
      },
      timestamp: new Date().toISOString(),
    });

    db.save();
    settings.set('lastSaveSlot', slot);

    return { success: true, slot, name: saveName };
  }

  /**
   * 加载存档
   * @param {number} slot - 存档槽位
   * @returns {Object|null} 存档数据
   */
  load(slot) {
    const save = db.findByField(SAVE_COLLECTION, 'slot', slot);
    if (!save) return null;

    return {
      ...save,
      age: Date.now() - new Date(save.timestamp).getTime(),
    };
  }

  /**
   * 列出所有存档
   * @returns {Array}
   */
  listAll() {
    const saves = db.findAll(SAVE_COLLECTION, { orderBy: 'slot asc' });
    const result = [];

    for (let i = 1; i <= MAX_SLOTS; i++) {
      const save = saves.find((s) => s.slot === i);
      result.push(
        save
          ? {
              slot: i,
              name: save.name,
              level: save.level,
              playerLevel: save.playerSummary.level,
              timestamp: save.timestamp,
              age: Date.now() - new Date(save.timestamp).getTime(),
            }
          : { slot: i, name: '空', empty: true }
      );
    }

    return result;
  }

  /**
   * 删除存档
   * @param {number} slot
   */
  deleteSave(slot) {
    const save = db.findByField(SAVE_COLLECTION, 'slot', slot);
    if (!save) return false;

    db.delete(SAVE_COLLECTION, save.id);
    db.save();
    return true;
  }

  /**
   * 获取最后使用的存档槽位
   */
  getLastSlot() {
    return settings.get('lastSaveSlot') || 1;
  }

  /**
   * 是否有任何存档
   */
  hasSaves() {
    const saves = db.findAll(SAVE_COLLECTION);
    return saves.length > 0;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const saves = db.findAll(SAVE_COLLECTION);
    return {
      total: saves.length,
      slots: saves.map((s) => s.slot),
      maxSlots: MAX_SLOTS,
    };
  }
}

const saveSystem = new SaveSystem();
export default saveSystem;
