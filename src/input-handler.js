/**
 * 键盘输入处理器
 * 跟踪按键状态，提供方向输入映射
 */

import { DIRECTION } from './player.js';

class InputHandler {
  constructor() {
    this.keys = new Set();
    this.onDirection = null;
    this.onAction = null;
    this.onMenu = null;

    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);
  }

  /**
   * 绑定到 window 事件
   */
  attach() {
    window.addEventListener('keydown', this._handleKeyDown);
    window.addEventListener('keyup', this._handleKeyUp);
  }

  /**
   * 解除绑定
   */
  detach() {
    window.removeEventListener('keydown', this._handleKeyDown);
    window.removeEventListener('keyup', this._handleKeyUp);
  }

  _handleKeyDown(e) {
    this.keys.add(e.code);

    const direction = this._codeToDirection(e.code);
    if (direction) {
      e.preventDefault();
      if (this.onDirection) {
        this.onDirection(direction);
      }
      return;
    }

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (this.onAction) this.onAction('interact');
        break;
      case 'KeyI':
        if (this.onAction) this.onAction('inventory');
        break;
      case 'Escape':
        if (this.onMenu) this.onMenu();
        break;
      case 'F5':
        e.preventDefault();
        if (this.onAction) this.onAction('save');
        break;
      case 'F9':
        e.preventDefault();
        if (this.onAction) this.onAction('load');
        break;
    }
  }

  _handleKeyUp(e) {
    this.keys.delete(e.code);
  }

  _codeToDirection(code) {
    const map = {
      ArrowUp: DIRECTION.UP,
      KeyW: DIRECTION.UP,
      ArrowDown: DIRECTION.DOWN,
      KeyS: DIRECTION.DOWN,
      ArrowLeft: DIRECTION.LEFT,
      KeyA: DIRECTION.LEFT,
      ArrowRight: DIRECTION.RIGHT,
      KeyD: DIRECTION.RIGHT,
      Numpad8: DIRECTION.UP,
      Numpad2: DIRECTION.DOWN,
      Numpad4: DIRECTION.LEFT,
      Numpad6: DIRECTION.RIGHT,
      Numpad7: { x: -1, y: -1, name: 'up-left' },
      Numpad9: { x: 1, y: -1, name: 'up-right' },
      Numpad1: { x: -1, y: 1, name: 'down-left' },
      Numpad3: { x: 1, y: 1, name: 'down-right' },
    };
    return map[code] || null;
  }

  /**
   * 检查某键是否按下
   */
  isDown(code) {
    return this.keys.has(code);
  }
}

export default InputHandler;
export { InputHandler };
