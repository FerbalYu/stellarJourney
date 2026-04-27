/**
 * 游戏入口
 * 初始化 Canvas 并启动 Game
 */

import Game from './game.js';

function init() {
  const canvas = document.getElementById('game-canvas');
  const messageEl = document.getElementById('message-log');

  if (!canvas) {
    console.error('找不到 #game-canvas 元素');
    return;
  }

  const game = new Game(canvas, messageEl);
  game.start();

  window.__game = game;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
