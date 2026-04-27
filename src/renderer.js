/**
 * Canvas 渲染引擎
 * 将地牢地图和迷雾叠加到 Canvas 上
 */

const TILE_COLORS = {
  0: '#000000', // VOID
  1: '#3d3d3d', // FLOOR - dark stone
  2: '#1a1a2e', // WALL
  3: '#8b4513', // DOOR - brown
  4: '#2d2d2d', // CORRIDOR
  5: '#228b22', // STAIRS_UP - green
  6: '#8b0000', // STAIRS_DOWN - red
};

class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} options
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.cellSize = options.cellSize || 16;
    this.viewportWidth = options.viewportWidth || 40;
    this.viewportHeight = options.viewportHeight || 30;
    this.cameraX = 0;
    this.cameraY = 0;

    canvas.width = this.viewportWidth * this.cellSize;
    canvas.height = this.viewportHeight * this.cellSize;
  }

  /**
   * 画布尺寸 (像素)
   */
  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  /**
   * 居中摄像机到指定坐标
   */
  centerCamera(tileX, tileY) {
    this.cameraX = tileX - Math.floor(this.viewportWidth / 2);
    this.cameraY = tileY - Math.floor(this.viewportHeight / 2);
  }

  /**
   * 世界坐标 → 屏幕像素坐标
   */
  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.cameraX) * this.cellSize,
      y: (worldY - this.cameraY) * this.cellSize,
    };
  }

  /**
   * 清空画布
   */
  clear() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * 渲染地牢地图
   * @param {number[][]} map - 2D 瓦片网格
   * @param {number} mapWidth
   * @param {number} mapHeight
   */
  renderMap(map, mapWidth, mapHeight) {
    const { ctx, cellSize } = this;

    const startX = Math.max(0, this.cameraX);
    const startY = Math.max(0, this.cameraY);
    const endX = Math.min(mapWidth, this.cameraX + this.viewportWidth + 1);
    const endY = Math.min(mapHeight, this.cameraY + this.viewportHeight + 1);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = map[y][x];
        const screen = this.worldToScreen(x, y);

        ctx.fillStyle = TILE_COLORS[tile] || '#ff00ff';
        ctx.fillRect(screen.x, screen.y, cellSize, cellSize);

        // 墙壁纹理线
        if (tile === 2) {
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          if ((x + y) % 3 === 0) {
            ctx.fillRect(screen.x, screen.y, cellSize, 1);
          }
        }
      }
    }
  }

  /**
   * 渲染玩家
   * @param {number} tileX
   * @param {number} tileY
   * @param {string} facing - up/down/left/right
   */
  renderPlayer(tileX, tileY, facing) {
    const { ctx, cellSize } = this;
    const screen = this.worldToScreen(tileX, tileY);
    const cx = screen.x + cellSize / 2;
    const cy = screen.y + cellSize / 2;
    const r = cellSize * 0.4;

    // 光晕
    ctx.save();
    const gradient = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.5);
    gradient.addColorStop(0, 'rgba(255, 255, 100, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(screen.x - cellSize, screen.y - cellSize, cellSize * 3, cellSize * 3);
    ctx.restore();

    // 身体
    ctx.fillStyle = '#ffdd44';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 方向指示器
    ctx.fillStyle = '#333';
    ctx.beginPath();
    switch (facing) {
      case 'up':
        ctx.moveTo(cx - r * 0.4, cy);
        ctx.lineTo(cx, cy - r * 0.6);
        ctx.lineTo(cx + r * 0.4, cy);
        break;
      case 'down':
        ctx.moveTo(cx - r * 0.4, cy);
        ctx.lineTo(cx, cy + r * 0.6);
        ctx.lineTo(cx + r * 0.4, cy);
        break;
      case 'left':
        ctx.moveTo(cx, cy - r * 0.4);
        ctx.lineTo(cx - r * 0.6, cy);
        ctx.lineTo(cx, cy + r * 0.4);
        break;
      case 'right':
        ctx.moveTo(cx, cy - r * 0.4);
        ctx.lineTo(cx + r * 0.6, cy);
        ctx.lineTo(cx, cy + r * 0.4);
        break;
    }
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 渲染 HUD 抬头显示
   * @param {Object} playerSummary - player.getSummary()
   * @param {number} currentLevel
   */
  renderHUD(playerSummary, currentLevel) {
    const { ctx } = this;
    const padding = 8;
    const barWidth = 200;
    const barHeight = 14;
    const barX = padding;
    const barY = this.height - barHeight - padding - 24;

    // HUD 背景
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, this.height - 60, this.width, 60);

    // HP 条
    const hpRatio = playerSummary.hp / playerSummary.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = hpRatio > 0.3 ? '#22aa22' : '#cc3333';
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.fillText(`HP: ${playerSummary.hp}/${playerSummary.maxHp}`, barX + 4, barY + 11);

    // XP 条
    const xpBarY = barY - barHeight - 2;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, xpBarY, barWidth, barHeight);
    ctx.fillStyle = '#6666ff';
    ctx.fillRect(
      barX,
      xpBarY,
      barWidth * (playerSummary.xp / (playerSummary.level * 50)),
      barHeight
    );
    ctx.fillStyle = '#aaa';
    ctx.fillText(`LV ${playerSummary.level}`, barX + 4, xpBarY + 11);

    // 层数
    ctx.fillStyle = '#ffdd44';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`第 ${currentLevel} 层`, padding, 20);

    // 属性
    ctx.font = '11px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`攻:${playerSummary.attack} 防:${playerSummary.defense}`, padding, 36);
    ctx.fillText(
      `${playerSummary.weapon} | ${playerSummary.armor} | 包:${playerSummary.inventory}`,
      padding,
      50
    );

    // 坐标
    ctx.fillText(
      `(${playerSummary.position.x}, ${playerSummary.position.y})`,
      this.width - 120,
      20
    );
  }

  /**
   * 渲染敌人
   * @param {Array} enemies
   */
  renderEnemies(enemies) {
    const { ctx, cellSize } = this;

    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;
      const screen = this.worldToScreen(enemy.x, enemy.y);

      const cx = screen.x + cellSize / 2;
      const cy = screen.y + cellSize / 2;
      const r = cellSize * 0.4;

      // 敌方光晕
      ctx.fillStyle = enemy.color.replace(')', ', 0.25)').replace('rgb', 'rgba');
      if (enemy.color.startsWith('#')) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 身体
      ctx.fillStyle = enemy.color;
      ctx.font = `${cellSize * 0.8}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(enemy.glyph, cx, cy + 1);

      // HP 条（低血量时显示）
      if (enemy.hp < enemy.maxHp) {
        const barW = cellSize * 0.8;
        const barH = 3;
        const bx = screen.x + (cellSize - barW) / 2;
        const by = screen.y + cellSize - 4;
        ctx.fillStyle = '#333';
        ctx.fillRect(bx, by, barW, barH);
        ctx.fillStyle = '#cc3333';
        ctx.fillRect(bx, by, barW * (enemy.hp / enemy.maxHp), barH);
      }

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  }

  /**
   * 渲染地面物品
   * @param {Array} groundItems - [{ item, x, y }]
   */
  renderItems(groundItems) {
    const { ctx, cellSize } = this;

    for (const { item, x, y } of groundItems) {
      const screen = this.worldToScreen(x, y);
      const cx = screen.x + cellSize / 2;
      const cy = screen.y + cellSize / 2;

      if (item.type === 'potion') {
        ctx.fillStyle = '#ff6688';
        ctx.font = `${cellSize * 0.65}px monospace`;
      } else if (item.type === 'weapon') {
        ctx.fillStyle = '#ffcc44';
        ctx.font = `${cellSize * 0.65}px monospace`;
      } else {
        ctx.fillStyle = '#88ccff';
        ctx.font = `${cellSize * 0.65}px monospace`;
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦', cx, cy);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  /**
   * 渲染游戏结束画面
   */
  renderGameOver() {
    const { ctx } = this;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#cc3333';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('你 已 死 亡', this.width / 2, this.height / 2 - 20);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText('刷新頁面重新開始', this.width / 2, this.height / 2 + 20);
    ctx.textAlign = 'left';
  }

  /**
   * 渲染消息日志
   * @param {string[]} messages
   */
  renderMessageLog(messages) {
    const { ctx } = this;
    const maxMessages = 5;
    const recent = messages.slice(-maxMessages);
    const padding = 8;

    ctx.font = '11px monospace';
    for (let i = 0; i < recent.length; i++) {
      const alpha = 1 - (maxMessages - 1 - i) * 0.15;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillText(recent[i], padding, 56 + i * 14);
    }
  }

  /**
   * 获取 FogOfWar 渲染所需的 cellSize 匹配
   * FogOfWar 内部以 cellSize=1 工作, 渲染时需要缩放
   */
  getFogCellSize() {
    return 1;
  }
}

  /**
   * 渲染胜利画面
   * @param {Object} playerSummary
   */
  renderVictory(playerSummary) {
    const { ctx } = this;
    ctx.fillStyle = 'rgba(0, 0, 20, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#ffdd44';
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ 通 關 ★', this.width / 2, this.height / 2 - 60);

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('你征服了星際征途！', this.width / 2, this.height / 2 - 20);

    ctx.fillStyle = '#aaa';
    ctx.font = '13px monospace';
    const stats = [
      `等級: ${playerSummary.level}  |  HP: ${playerSummary.hp}/${playerSummary.maxHp}`,
      `攻擊: ${playerSummary.attack}  |  防禦: ${playerSummary.defense}`,
      `武器: ${playerSummary.weapon}  |  護甲: ${playerSummary.armor}`,
    ];
    stats.forEach((s, i) => {
      ctx.fillText(s, this.width / 2, this.height / 2 + 10 + i * 22);
    });

    ctx.fillStyle = '#ffdd44';
    ctx.font = '14px monospace';
    ctx.fillText('感謝遊玩！', this.width / 2, this.height / 2 + 85);
    ctx.textAlign = 'left';
  }

  /**
   * 渲染小地图 (右上角)
   * @param {number[][]} map - 地牢地图
   * @param {number} mapW - 地图宽度
   * @param {number} mapH - 地图高度
   * @param {number} px - 玩家 x
   * @param {number} py - 玩家 y
   * @param {Array} enemies - 敌人列表
   */
  renderMinimap(map, mapW, mapH, px, py, enemies) {
    const { ctx } = this;
    const scale = 3; // 每个 tile 3px
    const mw = mapW * scale;
    const mh = mapH * scale;
    const mx = this.width - mw - 4;
    const my = 60;

    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#111';
    ctx.fillRect(mx - 2, my - 2, mw + 4, mh + 4);
    ctx.fillStyle = '#222';
    ctx.fillRect(mx, my, mw, mh);

    // 视野范围
    const viewCX = this.cameraX + Math.floor(this.viewportWidth / 2);
    const viewCY = this.cameraY + Math.floor(this.viewportHeight / 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(
      mx + (viewCX - this.viewportWidth / 2) * scale,
      my + (viewCY - this.viewportHeight / 2) * scale,
      this.viewportWidth * scale,
      this.viewportHeight * scale
    );

    // 房间 (简化为色块)
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const t = map[y][x];
        if (t === 1) ctx.fillStyle = '#3a3a3a';
        else if (t === 2) ctx.fillStyle = '#1a1a2e';
        else if (t === 3) ctx.fillStyle = '#5a2a0a';
        else if (t === 5 || t === 6) ctx.fillStyle = '#ffcc00';
        else continue;
        ctx.fillRect(mx + x * scale, my + y * scale, scale, scale);
      }
    }

    // 敌人红点
    for (const e of enemies) {
      if (!e.isAlive()) continue;
      ctx.fillStyle = '#ff3333';
      ctx.fillRect(mx + e.x * scale - 1, my + e.y * scale - 1, 2, 2);
    }

    // 玩家绿点
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(mx + px * scale - 2, my + py * scale - 2, 4, 4);

    ctx.restore();
  }

export default Renderer;
