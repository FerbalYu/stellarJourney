/**
 * Express 服务器入口文件
 * 整合所有路由和中间件
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';

import logger from './logger.js';
import { troubleshootRoutes } from './troubleshoot/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 安全中间件配置
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS 配置
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 压缩响应
app.use(compression());

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP 请求', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  });

  next();
});

// 静态文件服务
app.use(express.static(join(__dirname, '../public')));

// API 路由
app.use('/api/troubleshoot', troubleshootRoutes);

/**
 * 游戏版本 API
 * GET /api/game/version
 */
app.get('/api/game/version', (req, res) => {
  try {
    // 模拟版本信息（实际应从配置文件或数据库获取）
    const currentVersion = process.env.GAME_VERSION || '1.0.0';
    const latestVersion = process.env.LATEST_VERSION || '1.0.1';

    const currentParts = currentVersion.split('.').map(Number);
    const latestParts = latestVersion.split('.').map(Number);

    // 简单的版本比较
    let updateAvailable = false;
    for (let i = 0; i < 3; i++) {
      if (currentParts[i] < latestParts[i]) {
        updateAvailable = true;
        break;
      }
    }

    res.json({
      success: true,
      data: {
        currentVersion,
        latestVersion,
        updateAvailable,
        downloadUrl: process.env.DOWNLOAD_URL || '/download',
        releaseNotes: process.env.RELEASE_NOTES || '修复了若干问题，提升了稳定性',
      },
    });
  } catch (error) {
    logger.error('获取版本信息失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  }
});

/**
 * 健康检查端点
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: `${Math.floor(uptime / 60)}分钟${Math.floor(uptime % 60)}秒`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      },
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * API 根路径
 * GET /api
 */
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      name: '游戏故障排查 API',
      version: '1.0.0',
      endpoints: {
        troubleshoot: {
          steps: 'GET /api/troubleshoot/steps',
          log: 'POST /api/troubleshoot/log',
          complete: 'POST /api/troubleshoot/complete',
          stats: 'GET /api/troubleshoot/stats',
        },
        game: {
          version: 'GET /api/game/version',
        },
        health: 'GET /api/health',
      },
    },
  });
});

// SPA 路由支持 - 所有未匹配的路由返回 index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '请求的资源不存在',
    path: req.originalUrl,
  });
});

// 全局错误处理
app.use((err, req, res, _next) => {
  logger.error('未处理的错误', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // 生产环境不返回错误详情
  if (NODE_ENV === 'production') {
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  } else {
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  }
});

// 启动服务器
const server = app.listen(PORT, () => {
  logger.info(`服务器启动成功`, {
    port: PORT,
    env: NODE_ENV,
    nodeVersion: process.version,
    pid: process.pid,
  });
});

// 优雅关闭
const gracefulShutdown = (signal) => {
  logger.info(`收到 ${signal} 信号，开始优雅关闭...`);

  server.close(() => {
    logger.info('HTTP 服务器已关闭');
    process.exit(0);
  });

  // 强制关闭超时
  setTimeout(() => {
    logger.error('无法优雅关闭，强制退出');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
  logger.error('未处理的 Promise 拒绝', {
    reason: reason?.message || reason,
    stack: reason?.stack,
  });
});

export default app;
