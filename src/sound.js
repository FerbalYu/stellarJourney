/**
 * 程序化音效系统
 * 使用 Web Audio API 生成简单音效 (无需外部文件)
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
    this._initOnInteraction = this._initOnInteraction.bind(this);
    this._loadSettings();
    window.addEventListener('click', this._initOnInteraction, { once: true });
    window.addEventListener('keydown', this._initOnInteraction, { once: true });
  }

  _initOnInteraction() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_e) {
      this.enabled = false;
    }
  }

  _ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_e) {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * 播放短促音效
   */
  _play(freq, type, duration, vol = 1) {
    if (!this.enabled) return;
    const ctx = this._ensure();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(this.volume * vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  /** 脚步声 - 低频短脉冲 */
  footstep() {
    this._play(80, 'triangle', 0.08, 0.4);
  }

  /** 攻击命中 */
  attackHit() {
    const ctx = this._ensure();
    if (!ctx || !this.enabled) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  /** 暴击 */
  attackCrit() {
    const ctx = this._ensure();
    if (!ctx || !this.enabled) return;
    const now = ctx.currentTime;
    [300, 220].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(this.volume * 0.4, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.15);
    });
  }

  /** 开门 */
  doorOpen() {
    this._play(140, 'triangle', 0.12, 0.5);
    setTimeout(() => this._play(180, 'triangle', 0.08, 0.3), 60);
  }

  /** 拾取物品 */
  pickup() {
    this._play(600, 'sine', 0.06, 0.3);
    setTimeout(() => this._play(800, 'sine', 0.06, 0.3), 60);
  }

  /** 装备物品 */
  equip() {
    this._play(500, 'sine', 0.05, 0.25);
    setTimeout(() => this._play(700, 'sine', 0.05, 0.2), 50);
    setTimeout(() => this._play(900, 'sine', 0.08, 0.15), 100);
  }

  /** 受到伤害 */
  hurt() {
    this._play(120, 'sawtooth', 0.2, 0.4);
  }

  /** 死亡 */
  death() {
    const ctx = this._ensure();
    if (!ctx || !this.enabled) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.9);
  }

  /** 升级 */
  levelUp() {
    const ctx = this._ensure();
    if (!ctx || !this.enabled) return;
    [400, 500, 600, 800].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.15);
    });
  }

  /** 胜利 */
  victory() {
    const ctx = this._ensure();
    if (!ctx || !this.enabled) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
      gain.gain.setValueAtTime(this.volume * 0.35, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.3);
    });
  }

  /** 设置音量 */
  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this._saveSettings();
  }

  /** 开关音效 */
  toggle() {
    this.enabled = !this.enabled;
    this._saveSettings();
    return this.enabled;
  }

  _saveSettings() {
    try {
      localStorage.setItem('gameSettings', JSON.stringify({
        volume: this.volume,
        enabled: this.enabled,
      }));
    } catch (_e) { /* noop */ }
  }

  _loadSettings() {
    try {
      const raw = localStorage.getItem('gameSettings');
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.volume === 'number') this.volume = s.volume;
        if (typeof s.enabled === 'boolean') this.enabled = s.enabled;
      }
    } catch (_e) { /* defaults */ }
  }
}

const soundManager = new SoundManager();
export default soundManager;
export { SoundManager };
