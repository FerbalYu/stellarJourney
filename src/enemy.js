/**
 * 敌人实体系统
 * 包含敌人类型、AI 行为和战斗属性
 */

export const ENEMY_TYPES = {
  SLIME: {
    name: '史萊姆',
    glyph: 's',
    color: '#66ff66',
    baseHp: 20,
    attack: 3,
    defense: 0,
    xp: 5,
    ai: 'wander',
    description: '緩慢蠕動的綠色凝膠',
  },
  RAT: {
    name: '巨鼠',
    glyph: 'r',
    color: '#888888',
    baseHp: 15,
    attack: 5,
    defense: 1,
    xp: 8,
    ai: 'chase',
    description: '骯髒的巨型老鼠',
  },
  SKELETON: {
    name: '骷髏兵',
    glyph: 'S',
    color: '#eeeeee',
    baseHp: 35,
    attack: 8,
    defense: 3,
    xp: 15,
    ai: 'chase',
    description: '揮舞著生鏽武器的亡靈',
  },
  BAT: {
    name: '洞穴蝠',
    glyph: 'b',
    color: '#aa66cc',
    baseHp: 10,
    attack: 6,
    defense: 0,
    xp: 6,
    ai: 'wander',
    description: '在黑暗中掠過的翅膀',
  },
  ORC: {
    name: '獸人戰士',
    glyph: 'O',
    color: '#33aa33',
    baseHp: 50,
    attack: 12,
    defense: 5,
    xp: 25,
    ai: 'chase',
    description: '粗壯的綠皮戰士',
  },
  BOSS_DRAGON: {
    name: '地龍',
    glyph: 'D',
    color: '#ff3333',
    baseHp: 150,
    attack: 25,
    defense: 10,
    xp: 100,
    ai: 'boss',
    description: '守護深層的遠古巨獸',
  },
};

class Enemy {
  /**
   * @param {string} typeKey - ENEMY_TYPES key
   * @param {number} x - 格子 x 坐标
   * @param {number} y - 格子 y 坐标
   * @param {number} levelMod - 等级加成系数 (default 1)
   */
  constructor(typeKey, x, y, levelMod = 1) {
    const type = ENEMY_TYPES[typeKey];
    if (!type) throw new Error(`Unknown enemy type: ${typeKey}`);

    this.typeKey = typeKey;
    this.name = type.name;
    this.glyph = type.glyph;
    this.color = type.color;
    this.x = x;
    this.y = y;
    this.ai = type.ai;

    const mod = 1 + (levelMod - 1) * 0.15;
    this.maxHp = Math.floor(type.baseHp * mod);
    this.hp = this.maxHp;
    this.attack = Math.floor(type.attack * mod);
    this.defense = Math.floor(type.defense * mod);
    this.xp = Math.floor(type.xp * mod);
    this.description = type.description;

    this.lastMoveDir = null;
    this.wanderCooldown = 0;
  }

  isAlive() {
    return this.hp > 0;
  }

  takeDamage(amount) {
    const actual = Math.max(0, amount - this.defense);
    this.hp = Math.max(0, this.hp - actual);
    return actual;
  }

  /**
   * 获取 AI 决定的移动方向
   * @param {number} playerX
   * @param {number} playerY
   * @param {Function} canMove - (nx, ny) => boolean
   * @param {number} viewRange - 感知距离
   * @returns {{ x: number, y: number, name: string } | null}
   */
  getMove(playerX, playerY, canMove, viewRange = 6) {
    const dist = Math.abs(playerX - this.x) + Math.abs(playerY - this.y);

    switch (this.ai) {
      case 'chase':
        return this._chaseAI(playerX, playerY, canMove, dist, viewRange);
      case 'wander':
        return this._wanderAI(canMove);
      case 'boss':
        return this._chaseAI(playerX, playerY, canMove, dist, viewRange * 2);
      default:
        return null;
    }
  }

  _chaseAI(px, py, canMove, dist, viewRange) {
    if (dist > viewRange) return this._wanderAI(canMove);

    const dx = Math.sign(px - this.x);
    const dy = Math.sign(py - this.y);

    // 优先水平或垂直
    const candidates = [];
    if (dx !== 0) candidates.push({ x: dx, y: 0, name: 'chase' });
    if (dy !== 0) candidates.push({ x: 0, y: dy, name: 'chase' });
    if (dx !== 0 && dy !== 0) candidates.push({ x: dx, y: dy, name: 'chase' });

    for (const d of candidates) {
      if (canMove(this.x + d.x, this.y + d.y)) {
        return d;
      }
    }
    return null;
  }

  _wanderAI(canMove) {
    if (this.wanderCooldown > 0) {
      this.wanderCooldown--;
      return null;
    }

    this.wanderCooldown = Math.floor(Math.random() * 3) + 2;
    const dirs = [
      { x: 0, y: -1, name: 'up' },
      { x: 0, y: 1, name: 'down' },
      { x: -1, y: 0, name: 'left' },
      { x: 1, y: 0, name: 'right' },
    ];

    // 50% 概率不移动
    if (Math.random() < 0.5) return null;

    const shuffled = dirs.sort(() => Math.random() - 0.5);
    for (const d of shuffled) {
      if (canMove(this.x + d.x, this.y + d.y)) {
        return d;
      }
    }
    return null;
  }

  /**
   * 执行移动
   */
  move(direction) {
    if (!direction) return false;
    this.x += direction.x;
    this.y += direction.y;
    this.lastMoveDir = direction;
    return true;
  }
}

export default Enemy;
