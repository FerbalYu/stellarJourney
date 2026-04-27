/**
 * 配置文件
 * 包含应用的基础配置项
 */

const config = {
  // 应用配置
  app: {
    name: 'Basic Functionality',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
  },

  // 日志配置
  logger: {
    level: 'info',
    enableConsole: true,
  },

  // 功能开关
  features: {
    enableCache: true,
    enableValidation: true,
    enableErrorHandling: true,
  },
};

export default config;
