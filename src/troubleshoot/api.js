/**
 * 故障排查 API 路由模块
 * 提供排查相关的 REST API 接口
 */

import express from 'express';

import logger from '../logger.js';

const router = express.Router();

/**
 * @typedef {Object} TroubleshootLog
 * @property {number} step - 步骤编号 (1-4)
 * @property {string} timestamp - 完成时间 ISO 格式
 * @property {boolean} completed - 是否完成
 */

/**
 * @typedef {Object} TroubleshootStats
 * @property {number} totalRequests - 总请求数
 * @property {Object} stepCompletions - 各步骤完成统计
 * @property {number} completedTroubleshootings - 完成的排查次数
 */

/** @type {TroubleshootLog[]} */
const troubleshootLogs = [];

/** @type {TroubleshootStats} */
const stats = {
  totalRequests: 0,
  stepCompletions: { 1: 0, 2: 0, 3: 0, 4: 0 },
  completedTroubleshootings: 0,
};

/**
 * 记录排查步骤完成
 * POST /api/troubleshoot/log
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.post('/log', (req, res) => {
  try {
    const { step, timestamp, completed } = req.body;

    // 输入验证
    if (!Number.isInteger(step) || step < 1 || step > 4) {
      return res.status(400).json({
        success: false,
        error: '步骤编号无效，必须是 1-4 之间的整数',
      });
    }

    if (completed !== true) {
      return res.status(400).json({
        success: false,
        error: 'completed 字段必须为 true',
      });
    }

    // 记录日志
    const logEntry = {
      step,
      timestamp: timestamp || new Date().toISOString(),
      completed: true,
    };

    troubleshootLogs.push(logEntry);
    stats.totalRequests++;
    stats.stepCompletions[step]++;

    logger.info('排查步骤完成', {
      step,
      timestamp: logEntry.timestamp,
      totalRequests: stats.totalRequests,
    });

    res.json({
      success: true,
      message: `步骤 ${step} 完成已记录`,
      data: {
        step,
        timestamp: logEntry.timestamp,
      },
    });
  } catch (error) {
    logger.error('记录排查步骤失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  }
});

/**
 * 标记排查完成
 * POST /api/troubleshoot/complete
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.post('/complete', (req, res) => {
  try {
    stats.completedTroubleshootings++;

    logger.info('排查流程完成', {
      timestamp: new Date().toISOString(),
      completedTroubleshootings: stats.completedTroubleshootings,
    });

    res.json({
      success: true,
      message: '排查流程已完成',
      data: {
        completedAt: new Date().toISOString(),
        totalStepsCompleted: 4,
      },
    });
  } catch (error) {
    logger.error('标记排查完成失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  }
});

/**
 * 获取排查统计信息
 * GET /api/troubleshoot/stats
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.get('/stats', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        ...stats,
        recentLogs: troubleshootLogs.slice(-10),
      },
    });
  } catch (error) {
    logger.error('获取统计信息失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  }
});

/**
 * 获取排查步骤列表
 * GET /api/troubleshoot/steps
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.get('/steps', (req, res) => {
  try {
    const steps = [
      {
        id: 1,
        title: '重启设备',
        icon: '🔄',
        description: '重启设备是最基础的故障排查方法',
        instructions: [
          '保存当前所有工作',
          '完全关闭游戏程序',
          '关闭设备电源',
          '等待至少 10 秒钟',
          '重新启动设备',
          '再次打开游戏',
        ],
        warning: null,
      },
      {
        id: 2,
        title: '清除缓存',
        icon: '🧹',
        description: '清除游戏缓存可以解决因缓存文件损坏导致的问题',
        instructions: [
          '打开游戏设置菜单',
          '找到"清除缓存"或"清理数据"选项',
          '确认清除操作',
          '等待清除完成',
          '重新登录游戏',
        ],
        warning: '清除缓存不会删除您的游戏数据，但可能需要重新下载部分资源',
      },
      {
        id: 3,
        title: '切换网络',
        icon: '📶',
        description: '网络问题可能导致游戏无法正常连接',
        instructions: [
          '如果是 WiFi 连接，尝试切换到移动数据',
          '如果是移动数据，尝试切换到 WiFi',
          '重启路由器或光猫',
          '等待网络重新连接',
          '检查网络延迟是否正常',
        ],
        warning: '确保网络信号稳定，避免在网络切换时进行游戏',
      },
      {
        id: 4,
        title: '更新游戏版本',
        icon: '⬆️',
        description: '旧版本游戏可能存在已知的 Bug',
        instructions: [
          '打开游戏商店或应用市场',
          '搜索并进入游戏页面',
          '点击"更新"按钮',
          '等待下载和安装完成',
          '启动最新版本的游戏',
        ],
        warning: null,
      },
    ];

    res.json({
      success: true,
      data: {
        steps,
        totalSteps: steps.length,
      },
    });
  } catch (error) {
    logger.error('获取排查步骤失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  }
});

/**
 * 清除排查日志（仅用于测试）
 * POST /api/troubleshoot/reset
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.post('/reset', (req, res) => {
  try {
    // 仅在开发环境允许重置
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: '生产环境不允许重置数据',
      });
    }

    troubleshootLogs.length = 0;
    stats.totalRequests = 0;
    stats.stepCompletions = { 1: 0, 2: 0, 3: 0, 4: 0 };
    stats.completedTroubleshootings = 0;

    logger.info('排查日志已重置');

    res.json({
      success: true,
      message: '排查日志已重置',
    });
  } catch (error) {
    logger.error('重置排查日志失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  }
});

export default router;
