/**
 * 故障排查模块 - 入口文件
 * 提供故障排查相关的所有功能
 */

import troubleshootRoutes from './api.js';

/**
 * 排查步骤常量定义
 */
const TROUBLESHOOT_STEPS = {
  RESTART_DEVICE: 1,
  CLEAR_CACHE: 2,
  SWITCH_NETWORK: 3,
  UPDATE_VERSION: 4,
};

/**
 * 排查步骤配置
 */
const STEP_CONFIG = {
  [TROUBLESHOOT_STEPS.RESTART_DEVICE]: {
    id: 1,
    title: '重启设备',
    icon: '🔄',
    key: 'restartDevice',
    required: true,
  },
  [TROUBLESHOOT_STEPS.CLEAR_CACHE]: {
    id: 2,
    title: '清除缓存',
    icon: '🧹',
    key: 'clearCache',
    required: false,
  },
  [TROUBLESHOOT_STEPS.SWITCH_NETWORK]: {
    id: 3,
    title: '切换网络',
    icon: '📶',
    key: 'switchNetwork',
    required: false,
  },
  [TROUBLESHOOT_STEPS.UPDATE_VERSION]: {
    id: 4,
    title: '更新游戏版本',
    icon: '⬆️',
    key: 'updateVersion',
    required: true,
  },
};

/**
 * 故障排查管理器类
 */
class TroubleshootManager {
  constructor() {
    /** @type {Map<string, number>} 用户当前步骤映射 */
    this.userSteps = new Map();
  }

  /**
   * 初始化用户排查流程
   * @param {string} userId - 用户ID
   * @returns {Object} 初始化结果
   */
  initUserTroubleshoot(userId) {
    try {
      this.userSteps.set(userId, 1);

      return {
        success: true,
        data: {
          userId,
          currentStep: 1,
          totalSteps: 4,
          startedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 获取用户当前步骤
   * @param {string} userId - 用户ID
   * @returns {number} 当前步骤
   */
  getCurrentStep(userId) {
    return this.userSteps.get(userId) || 1;
  }

  /**
   * 完成指定步骤
   * @param {string} userId - 用户ID
   * @param {number} step - 步骤编号
   * @returns {Object} 完成结果
   */
  completeStep(userId, step) {
    try {
      if (step < 1 || step > 4) {
        throw new Error('步骤编号无效');
      }

      const currentStep = this.getCurrentStep(userId);

      if (step !== currentStep) {
        return {
          success: false,
          error: '步骤顺序不正确',
          currentStep,
          attemptedStep: step,
        };
      }

      // 更新步骤
      if (step === 4) {
        // 最后一步完成，清理用户数据
        this.userSteps.delete(userId);
        return {
          success: true,
          completed: true,
          message: '所有排查步骤已完成',
        };
      }

      this.userSteps.set(userId, step + 1);

      return {
        success: true,
        completed: false,
        nextStep: step + 1,
        progress: `${step}/4`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 重置用户排查流程
   * @param {string} userId - 用户ID
   */
  resetTroubleshoot(userId) {
    this.userSteps.delete(userId);
    return {
      success: true,
      message: '排查流程已重置',
    };
  }

  /**
   * 获取排查步骤配置
   * @returns {Object[]} 步骤配置列表
   */
  getStepConfig() {
    return Object.values(STEP_CONFIG);
  }

  /**
   * 验证步骤是否可执行
   * @param {number} step - 步骤编号
   * @returns {boolean} 是否可执行
   */
  isStepExecutable(step) {
    const config = STEP_CONFIG[step];
    if (!config) return false;

    // 必选项总是可执行
    if (config.required) return true;

    // 可选项需要检查前置条件（简化版，直接返回 true）
    return true;
  }
}

// 创建单例实例
const troubleshootManager = new TroubleshootManager();

export {
  troubleshootRoutes,
  TroubleshootManager,
  troubleshootManager,
  TROUBLESHOOT_STEPS,
  STEP_CONFIG,
};
