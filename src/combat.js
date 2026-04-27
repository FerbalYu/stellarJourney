/**
 * 回合制战斗系统
 */

/**
 * 计算攻击伤害
 * @param {Object} attacker - { attack, stats? }
 * @param {Object} defender - { defense, stats? }
 * @returns {{ damage: number, critical: boolean, missed: boolean, message: string }}
 */
export function calculateDamage(attacker, defender) {
  const att = attacker.stats ? attacker.stats.attack : attacker.attack || 0;
  const def = defender.stats ? defender.stats.defense : defender.defense || 0;

  // 基础伤害
  let base = Math.max(1, att - def * 0.5);

  // 随机波动 ±30%
  const variance = 0.3;
  base = Math.round(base * (1 + (Math.random() * 2 - 1) * variance));

  // 暴击率 10%
  const critChance = 0.1;
  const critical = Math.random() < critChance;

  // 命中率 90%
  const hitChance = 0.9;
  const missed = Math.random() >= hitChance;

  if (missed) {
    return { damage: 0, critical: false, missed: true, message: '攻擊未命中！' };
  }

  const damage = critical ? Math.floor(base * 1.8) : base;

  return {
    damage,
    critical,
    missed: false,
    message: critical ? `暴擊！造成 ${damage} 點傷害！` : `造成 ${damage} 點傷害。`,
  };
}

/**
 * 判断敌人是否在相邻格 (允许对角线)
 * @param {Object} player - { x, y }
 * @param {Object} enemy - { x, y }
 * @returns {boolean}
 */
export function isAdjacent(player, enemy) {
  const dx = Math.abs(player.x - enemy.x);
  const dy = Math.abs(player.y - enemy.y);
  return dx <= 1 && dy <= 1 && dx + dy > 0;
}

/**
 * 判断敌人是否在指定方向相邻
 * @param {Object} player - { x, y, facing: { x, y } }
 * @param {Object} enemy - { x, y }
 * @returns {boolean}
 */
export function isInAttackDirection(player, enemy) {
  return enemy.x === player.x + player.facing.x && enemy.y === player.y + player.facing.y;
}

/**
 * 回合制战斗逻辑
 * 返回战斗结果摘要
 *
 * @param {Object} player
 * @param {Object} enemy
 * @param {boolean} playerFirst - 玩家先手?
 * @returns {{ playerAlive: boolean, enemyAlive: boolean, logs: string[], enemyXp: number }}
 */
export function executeCombat(player, enemy, playerFirst = true) {
  const logs = [];

  if (playerFirst) {
    const result = calculateDamage(player, enemy);
    logs.push(`你${result.message}`);
    const actual = enemy.takeDamage(result.damage);

    if (!enemy.isAlive()) {
      logs.push(`${enemy.name} 被擊敗！`);
      player.xp += enemy.xp;
      logs.push(`獲得 ${enemy.xp} 經驗值。`);
      return { playerAlive: true, enemyAlive: false, logs, enemyXp: enemy.xp };
    }
  }

  // 敌人反击
  const enemyResult = calculateDamage(enemy, player);
  logs.push(`${enemy.name} ${enemyResult.message}`);
  player.takeDamage(enemyResult.damage);

  if (!player.isAlive()) {
    logs.push('你被擊敗了...');
    return { playerAlive: false, enemyAlive: true, logs, enemyXp: 0 };
  }

  // 如果非玩家先手且敌人都存活，再给玩家一次攻击
  if (!playerFirst && enemy.isAlive()) {
    const result2 = calculateDamage(player, enemy);
    logs.push(`你${result2.message}`);
    enemy.takeDamage(result2.damage);

    if (!enemy.isAlive()) {
      logs.push(`${enemy.name} 被擊敗！`);
      player.xp += enemy.xp;
      logs.push(`獲得 ${enemy.xp} 經驗值。`);
      return { playerAlive: true, enemyAlive: false, logs, enemyXp: enemy.xp };
    }
  }

  return { playerAlive: player.isAlive(), enemyAlive: enemy.isAlive(), logs, enemyXp: 0 };
}
