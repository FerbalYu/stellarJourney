/**
 * 故障排查功能测试
 */

import {
  TroubleshootManager,
  troubleshootManager,
  TROUBLESHOOT_STEPS,
  STEP_CONFIG,
} from '../src/troubleshoot/index.js';

describe('TroubleshootManager', () => {
  let manager;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    manager = new TroubleshootManager();
  });

  describe('initUserTroubleshoot', () => {
    it('应该正确初始化用户排查流程', () => {
      const result = manager.initUserTroubleshoot(testUserId);

      expect(result.success).toBe(true);
      expect(result.data.userId).toBe(testUserId);
      expect(result.data.currentStep).toBe(1);
      expect(result.data.totalSteps).toBe(4);
    });

    it('应该能够重新初始化已存在的用户', () => {
      manager.initUserTroubleshoot(testUserId);
      const result = manager.initUserTroubleshoot(testUserId);

      expect(result.success).toBe(true);
      expect(result.data.currentStep).toBe(1);
    });
  });

  describe('getCurrentStep', () => {
    it('应该返回用户当前步骤', () => {
      manager.initUserTroubleshoot(testUserId);
      expect(manager.getCurrentStep(testUserId)).toBe(1);
    });

    it('应该为新用户返回步骤1', () => {
      expect(manager.getCurrentStep('new-user')).toBe(1);
    });
  });

  describe('completeStep', () => {
    beforeEach(() => {
      manager.initUserTroubleshoot(testUserId);
    });

    it('应该正确完成第一步', () => {
      const result = manager.completeStep(testUserId, 1);

      expect(result.success).toBe(true);
      expect(result.completed).toBe(false);
      expect(result.nextStep).toBe(2);
      expect(result.progress).toBe('1/4');
    });

    it('应该正确完成所有步骤', () => {
      manager.completeStep(testUserId, 1);
      manager.completeStep(testUserId, 2);
      manager.completeStep(testUserId, 3);
      const result = manager.completeStep(testUserId, 4);

      expect(result.success).toBe(true);
      expect(result.completed).toBe(true);
      expect(result.message).toBe('所有排查步骤已完成');
    });

    it('不应该允许跳过步骤', () => {
      const result = manager.completeStep(testUserId, 2);

      expect(result.success).toBe(false);
      expect(result.error).toBe('步骤顺序不正确');
      expect(result.currentStep).toBe(1);
      expect(result.attemptedStep).toBe(2);
    });

    it('不应该允许完成无效步骤', () => {
      const result = manager.completeStep(testUserId, 0);

      expect(result.success).toBe(false);
      expect(result.error).toBe('步骤编号无效');
    });

    it('不应该允许完成超出范围的步骤', () => {
      const result = manager.completeStep(testUserId, 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe('步骤编号无效');
    });
  });

  describe('resetTroubleshoot', () => {
    it('应该正确重置用户排查流程', () => {
      manager.initUserTroubleshoot(testUserId);
      manager.completeStep(testUserId, 1);

      const result = manager.resetTroubleshoot(testUserId);

      expect(result.success).toBe(true);
      expect(manager.getCurrentStep(testUserId)).toBe(1);
    });
  });

  describe('getStepConfig', () => {
    it('应该返回所有步骤配置', () => {
      const config = manager.getStepConfig();

      expect(config).toHaveLength(4);
      expect(config[0].id).toBe(1);
      expect(config[0].title).toBe('重启设备');
    });
  });

  describe('isStepExecutable', () => {
    it('应该正确判断有效步骤', () => {
      expect(manager.isStepExecutable(1)).toBe(true);
      expect(manager.isStepExecutable(2)).toBe(true);
      expect(manager.isStepExecutable(3)).toBe(true);
      expect(manager.isStepExecutable(4)).toBe(true);
    });

    it('应该拒绝无效步骤', () => {
      expect(manager.isStepExecutable(0)).toBe(false);
      expect(manager.isStepExecutable(5)).toBe(false);
      expect(manager.isStepExecutable(-1)).toBe(false);
    });
  });
});

describe('TROUBLESHOOT_STEPS 常量', () => {
  it('应该包含所有步骤定义', () => {
    expect(TROUBLESHOOT_STEPS.RESTART_DEVICE).toBe(1);
    expect(TROUBLESHOOT_STEPS.CLEAR_CACHE).toBe(2);
    expect(TROUBLESHOOT_STEPS.SWITCH_NETWORK).toBe(3);
    expect(TROUBLESHOOT_STEPS.UPDATE_VERSION).toBe(4);
  });
});

describe('STEP_CONFIG 配置', () => {
  it('应该包含所有步骤的图标', () => {
    expect(STEP_CONFIG[1].icon).toBe('🔄');
    expect(STEP_CONFIG[2].icon).toBe('🧹');
    expect(STEP_CONFIG[3].icon).toBe('📶');
    expect(STEP_CONFIG[4].icon).toBe('⬆️');
  });

  it('应该包含所有步骤的标题', () => {
    expect(STEP_CONFIG[1].title).toBe('重启设备');
    expect(STEP_CONFIG[2].title).toBe('清除缓存');
    expect(STEP_CONFIG[3].title).toBe('切换网络');
    expect(STEP_CONFIG[4].title).toBe('更新游戏版本');
  });
});

describe('单例实例', () => {
  it('troubleshootManager 应该是 TroubleshootManager 实例', () => {
    expect(troubleshootManager).toBeInstanceOf(TroubleshootManager);
  });
});
