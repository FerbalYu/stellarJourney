/**
 * 设置持久化系统
 * 管理游戏设置的 localStorage 读写
 */

const SETTINGS_KEY = 'stellarJourneySettings';

const DEFAULTS = {
  bgmVolume: 80,
  sfxVolume: 100,
  quality: 'high',
  fullscreen: false,
  language: 'zh-CN',
  showMinimap: true,
};

class Settings {
  constructor() {
    this._data = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        return { ...DEFAULTS, ...JSON.parse(raw) };
      }
    } catch (_e) { /* use defaults */ }
    return { ...DEFAULTS };
  }

  _save() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this._data));
    } catch (_e) { /* quota exceeded, ignore */ }
  }

  get(key) {
    return this._data[key];
  }

  set(key, value) {
    this._data[key] = value;
    this._save();
  }

  getAll() {
    return { ...this._data };
  }

  reset() {
    this._data = { ...DEFAULTS };
    this._save();
  }

  /** 生成 settings 对象的 HTML 摘要 */
  describe() {
    return `
音量: ${this._data.bgmVolume}% | SFX: ${this._data.sfxVolume}% | 畫質: ${this._data.quality} | 語言: ${this._data.language}
全屏: ${this._data.fullscreen ? '是' : '否'} | 小地圖: ${this._data.showMinimap ? '開' : '關'}
`.trim();
  }
}

const settings = new Settings();
export default settings;
