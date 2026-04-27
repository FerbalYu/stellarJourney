/**
 * 游戏主循环
 * 串联地牢生成、玩家、视野、输入、渲染、战斗、敌人、物品
 */

import { executeCombat, isAdjacent, isInAttackDirection } from './combat.js';
import DungeonGenerator from './dungeon.js';
import Enemy from './enemy.js';
import InputHandler from './input-handler.js';
import Player from './player.js';
import Renderer from './renderer.js';
import { spawnEnemies, spawnItems } from './spawner.js';
import { tilesToObstacles, isBlocked } from './tile-converter.js';
import FogOfWar from './visibility/FogOfWar.js';
import { FogState } from './visibility/types.js';

const TILE = { VOID: 0, FLOOR: 1, WALL: 2, DOOR: 3, CORRIDOR: 4, STAIRS_UP: 5, STAIRS_DOWN: 6 };

class Game {
  constructor(canvas, messageEl) {
    this.renderer = new Renderer(canvas, {
      cellSize: 16,
      viewportWidth: 40,
      viewportHeight: 30,
    });

    this.messageEl = messageEl;
    this.input = new InputHandler();
    this.player = null;
    this.enemies = [];
    this.groundItems = [];
    this.fog = null;
    this.currentLevelNum = 1;
    this.messages = [];
    this.map = null;
    this.mapWidth = 0;
    this.mapHeight = 0;
    this.obstacles = [];
    this.running = false;
    this.gameOver = false;
    this.animFrameId = null;
    this.moveCooldown = 0;
    this.moveDelay = 6;
    this.turnCounter = 0;
    this.rooms = [];

    this._boundLoop = this._loop.bind(this);
  }

  start() {
    this.generateLevel(1);
    this.input.attach();
    this.input.onDirection = (dir) => this._handleMove(dir);
    this.input.onAction = (action) => this._handleAction(action);
    this.input.onMenu = () => this._handleMenu();
    this.running = true;
    this.gameOver = false;
    this.moveCooldown = 0;
    this._loop();
    this._logMessage('歡迎來到星際征途！使用方向鍵/WASD 移動，接近敵人自動攻擊。');
  }

  stop() {
    this.running = false;
    this.input.detach();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  generateLevel(levelNum) {
    this.currentLevelNum = levelNum;

    const generator = new DungeonGenerator({
      width: 80,
      height: 60,
      minRoomSize: 4,
      maxRoomSize: 12,
      bspDepth: Math.min(7, Math.floor(5 + levelNum * 0.2)),
      level: levelNum,
    });

    const result = generator.generate();
    this.map = result.map;
    this.mapWidth = result.width;
    this.mapHeight = result.height;
    this.rooms = result.rooms;
    this.obstacles = tilesToObstacles(this.map, this.mapWidth, this.mapHeight, 1);

    // 玩家放在起始房间
    const startRoom = result.rooms[0];
    const center = startRoom.getCenter();
    if (!this.player) {
      this.player = new Player(center.x, center.y);
    } else {
      this.player.x = center.x;
      this.player.y = center.y;
    }

    // 生成敌人
    this.enemies = spawnEnemies(this.rooms, this.map, this.currentLevelNum);

    // 生成物品
    this.groundItems = spawnItems(this.rooms, this.currentLevelNum);

    // 初始化迷雾
    this.fog = new FogOfWar({
      width: this.mapWidth,
      height: this.mapHeight,
      cellSize: 1,
      viewRadius: 8,
    });

    for (const seg of this.obstacles) {
      this.fog.addObstacle(seg);
    }
    this.fog.setObserverPosition(this.player.x, this.player.y);

    const roomCount = this.rooms.length;
    const enemyCount = this.enemies.length;
    this._logMessage(`進入第 ${levelNum} 層。${roomCount} 房間，${enemyCount} 敵人。`);
  }

  _loop() {
    if (!this.running) return;

    this.moveCooldown = Math.max(0, this.moveCooldown - 1);
    this._render();
    this.animFrameId = requestAnimationFrame(this._boundLoop);
  }

  _render() {
    const { renderer } = this;

    renderer.clear();
    renderer.centerCamera(this.player.x, this.player.y);

    renderer.renderMap(this.map, this.mapWidth, this.mapHeight);
    this._renderFog();
    renderer.renderItems(this.groundItems);
    renderer.renderEnemies(this.enemies);
    renderer.renderPlayer(this.player.x, this.player.y, this.player.facing.name);
    renderer.renderHUD(this.player.getSummary(), this.currentLevelNum);
    renderer.renderMessageLog(this.messages);

    if (this.gameOver) {
      renderer.renderGameOver();
    }

    if (this.messageEl && this.messages.length > 0) {
      this.messageEl.textContent = this.messages[this.messages.length - 1];
    }
  }

  _renderFog() {
    if (!this.fog) return;
    const { ctx, cellSize } = this.renderer;

    for (let wy = 0; wy < this.mapHeight; wy++) {
      for (let wx = 0; wx < this.mapWidth; wx++) {
        const state = this.fog.getFogState(wx, wy);
        if (state === FogState.HIDDEN) {
          const screen = this.renderer.worldToScreen(wx, wy);
          ctx.fillStyle = 'rgba(0, 0, 0, 1)';
          ctx.fillRect(screen.x, screen.y, cellSize, cellSize);
        } else if (state === FogState.REMEMBERED) {
          const screen = this.renderer.worldToScreen(wx, wy);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(screen.x, screen.y, cellSize, cellSize);
        }
      }
    }
  }

  _handleMove(direction) {
    if (this.gameOver || this.moveCooldown > 0) return;
    this.moveCooldown = this.moveDelay;

    const nx = this.player.x + direction.x;
    const ny = this.player.y + direction.y;

    // 检查目标位置是否有敌人 → 攻击
    const targetEnemy = this._enemyAt(nx, ny);
    if (targetEnemy) {
      this._doCombat(targetEnemy);
      this._enemyTurn();
      return;
    }

    // 检查能否移动
    const moved = this.player.tryMove(direction, (mx, my) => {
      if (mx < 0 || my < 0 || mx >= this.mapWidth || my >= this.mapHeight) return false;
      return this.map[my][mx] !== TILE.WALL;
    });

    if (moved) {
      this._onPlayerMoved();
    }
  }

  _handleAction(action) {
    if (this.gameOver) return;

    if (action === 'interact') {
      const fx = this.player.x + this.player.facing.x;
      const fy = this.player.y + this.player.facing.y;
      if (fy >= 0 && fy < this.mapHeight && fx >= 0 && fx < this.mapWidth) {
        const tile = this.map[fy][fx];
        if (tile === TILE.DOOR) {
          this._openDoor(fx, fy);
        }
      }

      // 拾取脚下物品
      this._pickupItem();
    }

    if (action === 'inventory') {
      this._showInventory();
    }
  }

  _handleMenu() {
    if (this.gameOver) return;
    this._logMessage('遊戲暫停。');
  }

  _onPlayerMoved() {
    this.fog.setObserverPosition(this.player.x, this.player.y);
    this._pickupItem();

    const tile = this.map[this.player.y][this.player.x];
    if (tile === TILE.STAIRS_DOWN) {
      this.generateLevel(this.currentLevelNum + 1);
      this._logMessage(`下降至第 ${this.currentLevelNum} 層。`);
      return;
    }
    if (tile === TILE.STAIRS_UP) {
      if (this.currentLevelNum > 1) {
        this.generateLevel(this.currentLevelNum - 1);
        this._logMessage(`上升至第 ${this.currentLevelNum} 層。`);
        return;
      }
    }

    this._enemyTurn();
  }

  _doCombat(enemy) {
    const result = executeCombat(this.player, enemy, true);
    for (const msg of result.logs) {
      this._logMessage(msg);
    }

    if (result.enemyXp > 0) {
      this._checkLevelUp();
    }

    if (!this.player.isAlive()) {
      this._onPlayerDeath();
    }

    // 清理死敌
    this.enemies = this.enemies.filter((e) => e.isAlive());
  }

  _enemyTurn() {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue;

      // 检查是否相邻 → 攻击
      if (isAdjacent(this.player, enemy)) {
        const result = executeCombat(this.player, enemy, true);
        for (const msg of result.logs) {
          this._logMessage(msg);
        }
        if (!this.player.isAlive()) {
          this._onPlayerDeath();
          return;
        }
        continue;
      }

      // AI 移动
      const dir = enemy.getMove(this.player.x, this.player.y, (mx, my) => {
        if (mx < 0 || my < 0 || mx >= this.mapWidth || my >= this.mapHeight) return false;
        if (this.map[my][mx] === TILE.WALL) return false;
        if (this.player.x === mx && this.player.y === my) return false;
        return !this._enemyAt(mx, my);
      });

      if (dir) {
        enemy.move(dir);
      }
    }

    this.enemies = this.enemies.filter((e) => e.isAlive());
  }

  _enemyAt(x, y) {
    return this.enemies.find((e) => e.isAlive() && e.x === x && e.y === y);
  }

  _pickupItem() {
    const idx = this.groundItems.findIndex(
      (gi) => gi.x === this.player.x && gi.y === this.player.y
    );
    if (idx === -1) return;

    const { item } = this.groundItems[idx];
    this.player.addToInventory(item);

    // 自动装备更好的武器/护甲
    if (item.type === 'weapon') {
      const current = this.player.equipment.weapon;
      if (!current || (item.attack || 0) > (current.attack || 0)) {
        this.player.equip(item);
        this._logMessage(`裝備了 ${item.name}！`);
      } else {
        this._logMessage(`拾取 ${item.name} (已放入背包)。`);
      }
    } else if (item.type === 'armor') {
      const current = this.player.equipment.armor;
      if (!current || (item.defense || 0) > (current.defense || 0)) {
        this.player.equip(item);
        this._logMessage(`裝備了 ${item.name}！`);
      } else {
        this._logMessage(`拾取 ${item.name} (已放入背包)。`);
      }
    } else {
      this._logMessage(`拾取 ${item.name}。`);
    }

    this.groundItems.splice(idx, 1);
  }

  _openDoor(fx, fy) {
    this.map[fy][fx] = TILE.FLOOR;
    this.obstacles = tilesToObstacles(this.map, this.mapWidth, this.mapHeight, 1);
    this.fog.obstacles = [];
    this.fog.wallSegments = [];
    for (const seg of this.obstacles) {
      this.fog.addObstacle(seg);
    }
    this.fog.setObserverPosition(this.player.x, this.player.y);
    this._logMessage('打開了門。');
  }

  _showInventory() {
    const inv = this.player.inventory;
    if (inv.length === 0) {
      this._logMessage('背包是空的。');
      return;
    }

    this._logMessage(`--- 背包 (${inv.length} 件) ---`);
    for (const item of inv) {
      let detail = '';
      if (item.type === 'weapon') detail = ` [攻+${item.attack}]`;
      if (item.type === 'armor') detail = ` [防+${item.defense}]`;
      if (item.type === 'potion') detail = ` [恢復${item.heal}HP]`;
      this._logMessage(`  ${item.name}${detail}`);
    }
    this._logMessage('按 I 關閉背包。使用藥水請按數字鍵。');
  }

  _checkLevelUp() {
    const xpNeeded = this.player.level * 50;
    if (this.player.xp >= xpNeeded) {
      this.player.xp -= xpNeeded;
      this.player.level++;
      this.player.maxHp += 15;
      this.player.hp = this.player.maxHp;
      this.player.stats.attack += 2;
      this.player.stats.defense += 1;
      this._logMessage(`升級！達到第 ${this.player.level} 級！血量恢復。`);
    }
  }

  _onPlayerDeath() {
    this.gameOver = true;
    this.input.detach();
    this._logMessage('你已死亡。刷新頁面重新開始。');
  }

  _logMessage(msg) {
    this.messages.push(msg);
    if (this.messages.length > 100) {
      this.messages.shift();
    }
  }

  getState() {
    return {
      level: this.currentLevelNum,
      player: this.player ? this.player.getSummary() : null,
      running: this.running,
      gameOver: this.gameOver,
      mapSize: { w: this.mapWidth, h: this.mapHeight },
      obstacleCount: this.obstacles.length,
      enemyCount: this.enemies.filter((e) => e.isAlive()).length,
      itemCount: this.groundItems.length,
    };
  }
}

export default Game;
