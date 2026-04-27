/**
 * 物品系统
 * 定义物品类型、属性和生成逻辑
 */

export const ITEM_TYPES = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  POTION: 'potion',
};

export const WEAPONS = {
  RUSTY_SWORD: { name: '生鏽劍', type: 'weapon', attack: 3, description: '一把老舊但還能用的劍' },
  SHORT_SWORD: { name: '短劍', type: 'weapon', attack: 6, description: '輕便的短劍' },
  LONG_SWORD: { name: '長劍', type: 'weapon', attack: 10, description: '精鋼打造的長劍' },
  FLAME_BLADE: { name: '烈焰刀', type: 'weapon', attack: 16, description: '刀身纏繞著火焰' },
  VOID_SLAYER: { name: '虛空斬', type: 'weapon', attack: 25, description: '來自深淵的傳說武器' },
};

export const ARMORS = {
  LEATHER: { name: '皮甲', type: 'armor', defense: 2, description: '動物皮革縫製的輕甲' },
  CHAINMAIL: { name: '鎖子甲', type: 'armor', defense: 5, description: '鐵環編織的護甲' },
  PLATE_ARMOR: { name: '板甲', type: 'armor', defense: 8, description: '厚重的鋼鐵鎧甲' },
  DRAGON_SCALE: { name: '龍鱗甲', type: 'armor', defense: 14, description: '龍鱗鑄造的防具' },
};

export const POTIONS = {
  SMALL_HP: { name: '小型生命藥水', type: 'potion', heal: 25, description: '恢復 25 HP' },
  MEDIUM_HP: { name: '中型生命藥水', type: 'potion', heal: 50, description: '恢復 50 HP' },
  LARGE_HP: { name: '大型生命藥水', type: 'potion', heal: 100, description: '恢復 100 HP' },
};

/**
 * 创建物品实例
 * @param {Object} template - WEAPONS/ARMORS/POTIONS 条目
 * @returns {Object} 物品对象
 */
export function createItem(template) {
  return {
    ...template,
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
  };
}

/**
 * 根据地牢层数生成随机掉落
 * @param {number} level - 地牢层数
 * @param {boolean} isTreasureRoom - 是否宝箱房
 * @returns {Object | null}
 */
export function generateRandomLoot(level, isTreasureRoom = false) {
  const roll = Math.random();
  const bonus = isTreasureRoom ? 2 : 0;

  // 药水 (40%)
  if (roll < 0.4) {
    if (level + bonus >= 6 && Math.random() < 0.3) return createItem(POTIONS.LARGE_HP);
    if (level + bonus >= 3 && Math.random() < 0.5) return createItem(POTIONS.MEDIUM_HP);
    return createItem(POTIONS.SMALL_HP);
  }

  // 武器 (30%)
  if (roll < 0.7) {
    if (level + bonus >= 8 && Math.random() < 0.15) return createItem(WEAPONS.VOID_SLAYER);
    if (level + bonus >= 6 && Math.random() < 0.3) return createItem(WEAPONS.FLAME_BLADE);
    if (level + bonus >= 4 && Math.random() < 0.4) return createItem(WEAPONS.LONG_SWORD);
    if (level + bonus >= 2 && Math.random() < 0.5) return createItem(WEAPONS.SHORT_SWORD);
    return createItem(WEAPONS.RUSTY_SWORD);
  }

  // 护甲 (30%)
  if (level + bonus >= 7 && Math.random() < 0.2) return createItem(ARMORS.DRAGON_SCALE);
  if (level + bonus >= 5 && Math.random() < 0.35) return createItem(ARMORS.PLATE_ARMOR);
  if (level + bonus >= 3 && Math.random() < 0.5) return createItem(ARMORS.CHAINMAIL);
  return createItem(ARMORS.LEATHER);
}

/**
 * 生成 BOSS 专属掉落
 */
export function generateBossLoot() {
  const roll = Math.random();
  if (roll < 0.4) return createItem(WEAPONS.VOID_SLAYER);
  if (roll < 0.7) return createItem(ARMORS.DRAGON_SCALE);
  return createItem(POTIONS.LARGE_HP);
}
