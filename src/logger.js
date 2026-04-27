/**
 * 日志模块
 * 提供统一的日志记录功能
 */

import config from './config.js';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = LOG_LEVELS[config.logger.level] || LOG_LEVELS.info;

/**
 * 格式化日志消息
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 * @param {Object} data - 附加数据
 * @returns {string}
 */
function formatMessage(level, message, data) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
}

/**
 * 输出日志
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 * @param {Object} data - 附加数据
 */
function log(level, message, data) {
  if (LOG_LEVELS[level] <= currentLevel) {
    const formattedMessage = formatMessage(level, message, data);
    if (config.logger.enableConsole) {
      if (level === 'error') {
        // eslint-disable-next-line no-console
        console.error(formattedMessage);
      } else if (level === 'warn') {
        console.warn(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    }
  }
}

const logger = {
  error(message, data) {
    log('error', message, data);
  },

  warn(message, data) {
    log('warn', message, data);
  },

  info(message, data) {
    log('info', message, data);
  },

  debug(message, data) {
    log('debug', message, data);
  },
};

export default logger;
