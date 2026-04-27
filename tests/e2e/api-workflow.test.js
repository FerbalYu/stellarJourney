/**
 * 设置系统测试
 * 测试 settings 模块的 localStorage 读写
 */

import settings from '../../src/settings.js';

describe('Settings', () => {
  const STORAGE_KEY = 'stellarJourneySettings';

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    settings.reset();
  });

  it('should return default values', () => {
    expect(settings.get('bgmVolume')).toBe(80);
    expect(settings.get('language')).toBe('zh-CN');
    expect(settings.get('showMinimap')).toBe(true);
  });

  it('should set and get values', () => {
    settings.set('bgmVolume', 50);
    expect(settings.get('bgmVolume')).toBe(50);
  });

  it('should persist to localStorage', () => {
    settings.set('quality', 'low');
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw);
    expect(parsed.quality).toBe('low');
  });

  it('should reset to defaults', () => {
    settings.set('bgmVolume', 10);
    settings.set('language', 'en-US');
    settings.reset();
    expect(settings.get('bgmVolume')).toBe(80);
    expect(settings.get('language')).toBe('zh-CN');
  });

  it('should return all settings', () => {
    const all = settings.getAll();
    expect(all.bgmVolume).toBe(80);
    expect(all.sfxVolume).toBe(100);
  });

  it('should describe settings', () => {
    const desc = settings.describe();
    expect(desc).toContain('音量');
    expect(desc).toContain('SFX');
  });
});
