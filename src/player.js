/**
 * 玩家实体类
 * 管理玩家的位置、属性和移动
 */

export const DIRECTION = {
  UP: { x: 0, y: -1, name: 'up' },
  DOWN: { x: 0, y: 1, name: 'down' },
  LEFT: { x: -1, y: 0, name: 'left' },
  RIGHT: { x: 1, y: 0, name: 'right' },
};

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.facing = DIRECTION.DOWN;

    this.maxHp = 100;
    this.hp = 100;
    this.level = 1;
    this.xp = 0;

    this.stats = {
      attack: 10,
      defense: 5,
      speed: 1,
    };

    this.inventory = [];
    this.equipment = {
      weapon: null,
      armor: null,
    };
  }

  /**
   * 尝试向指定方向移动
   * @param {Object} direction - DIRECTION 对象
   * @param {Function} canMove - (x, y) => boolean 碰撞检测回调
   * @returns {boolean} 是否成功移动
   */
  tryMove(direction, canMove) {
    this.facing = direction;
    const nx = this.x + direction.x;
    const ny = this.y + direction.y;

    if (canMove(nx, ny)) {
      this.x = nx;
      this.y = ny;
      return true;
    }
    return false;
  }

  /**
   * 获取当前像素坐标 (用于渲染)
   * @param {number} cellSize - 单元格像素大小
   * @returns {{ x: number, y: number }}
   */
  getPixelPosition(cellSize = 1) {
    return {
      x: this.x * cellSize + cellSize / 2,
      y: this.y * cellSize + cellSize / 2,
    };
  }

  /**
   * 受到伤害
   * @param {number} amount - 伤害值
   * @returns {number} 实际伤害
   */
  takeDamage(amount) {
    const actualDamage = Math.max(0, amount - this.stats.defense);
    this.hp = Math.max(0, this.hp - actualDamage);
    return actualDamage;
  }

  /**
   * 是否存活
   */
  isAlive() {
    return this.hp > 0;
  }

  /**
   * 治疗
   * @param {number} amount
   */
  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  /**
   * 装备物品 (武器或护甲)
   * @param {Object} item - { type, attack?, defense?, name }
   */
  equip(item) {
    if (item.type === 'weapon') {
      if (this.equipment.weapon) {
        this.stats.attack -= this.equipment.weapon.attack || 0;
      }
      this.equipment.weapon = item;
      this.stats.attack += item.attack || 0;
    } else if (item.type === 'armor') {
      if (this.equipment.armor) {
        this.stats.defense -= this.equipment.armor.defense || 0;
      }
      this.equipment.armor = item;
      this.stats.defense += item.defense || 0;
    }
  }

  /**
   * 使用药水
   * @param {Object} item - { type, heal? }
   * @returns {number} 恢复量
   */
  usePotion(item) {
    if (item.type !== 'potion' || !item.heal) return 0;
    const before = this.hp;
    this.heal(item.heal);
    return this.hp - before;
  }

  /**
   * 添加物品到背包
   */
  addToInventory(item) {
    this.inventory.push(item);
  }

  /**
   * 移除背包物品
   */
  removeFromInventory(itemId) {
    const idx = this.inventory.findIndex((i) => i.id === itemId);
    if (idx !== -1) {
      this.inventory.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * 获取总攻击力 (含装备加成)
   */
  getAttack() {
    return this.stats.attack;
  }

  /**
   * 获取总防御力 (含装备加成)
   */
  getDefense() {
    return this.stats.defense;
  }

  /**
   * 获取属性总览
   */
  getSummary() {
    return {
      position: { x: this.x, y: this.y },
      facing: this.facing.name,
      hp: this.hp,
      maxHp: this.maxHp,
      level: this.level,
      xp: this.xp,
      attack: this.getAttack(),
      defense: this.getDefense(),
      weapon: this.equipment.weapon ? this.equipment.weapon.name : '無',
      armor: this.equipment.armor ? this.equipment.armor.name : '無',
      inventory: this.inventory.length,
    };
  }
}

export default Player;
