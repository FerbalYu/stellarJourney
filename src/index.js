/**
 * 基础功能入口文件
 * 整合所有模块，提供统一的API
 */

import config from './config.js';
import logger from './logger.js';
import * as utils from './utils.js';
import * as validator from './validator.js';

/**
 * 应用类
 * 提供应用级别的基础功能
 */
class Application {
  constructor(options = {}) {
    this.name = options.name || config.app.name;
    this.version = options.version || config.app.version;
    this.initialized = false;
  }

  /**
   * 初始化应用
   */
  initialize() {
    if (this.initialized) {
      logger.warn('应用已经初始化');
      return;
    }

    try {
      logger.info(`初始化应用: ${this.name} v${this.version}`);
      this.initialized = true;
      logger.info('应用初始化完成');
    } catch (error) {
      logger.error('应用初始化失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 获取健康状态
   * @returns {Object}
   */
  getHealth() {
    return {
      status: 'ok',
      name: this.name,
      version: this.version,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 创建应用实例
 * @param {Object} options - 配置选项
 * @returns {Application}
 */
function createApp(options = {}) {
  return new Application(options);
}

/**
 * 运行演示
 */
function runDemo() {
  logger.info('开始运行演示...');

  // 演示工具函数
  const userId = utils.generateId();
  logger.info(`生成的用户ID: ${userId}`);

  const now = new Date();
  const formattedDate = utils.formatDate(now, 'YYYY-MM-DD HH:mm:ss');
  logger.info(`格式化日期: ${formattedDate}`);

  // 演示验证功能
  const emailValidation = validator.validateString('test@example.com', {
    fieldName: '邮箱',
    required: true,
    email: true,
  });
  logger.info(`邮箱验证: ${emailValidation.isValid ? '通过' : '失败'}`);

  const phoneValidation = validator.validateString('13800138000', {
    fieldName: '手机号',
    required: true,
    phone: true,
  });
  logger.info(`手机号验证: ${phoneValidation.isValid ? '通过' : '失败'}`);

  // 创建并初始化应用
  const app = createApp();
  app.initialize();

  // 获取健康状态
  const health = app.getHealth();
  logger.info('应用健康状态', health);

  logger.info('演示完成');
}

// 主程序入口 (Node.js ESM: import.meta.url matches when run directly)
if (import.meta.url.endsWith('/index.js') || import.meta.url.includes('/src/index')) {
  try {
    runDemo();
  } catch (error) {
    logger.error('程序执行出错', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

export { createApp, Application, config, logger, utils, validator, runDemo };
