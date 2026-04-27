/**
 * 测试工具函数
 * 提供测试中常用的辅助函数
 */

const crypto = require('node:crypto');

/**
 * 生成随机测试数据
 */
const generateRandomString = (length = 10) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

/**
 * 生成随机邮箱
 */
const generateRandomEmail = () => {
  const id = generateRandomString(8);
  return `test-${id}@example.com`;
};

/**
 * 生成随机用户名
 */
const generateRandomUsername = () => {
  return `user_${generateRandomString(8)}`;
};

/**
 * 生成测试用户数据
 */
const generateTestUser = (overrides = {}) => {
  return {
    username: generateRandomUsername(),
    email: generateRandomEmail(),
    password: 'SecurePass123!',
    ...overrides,
  };
};

/**
 * 生成测试帖子数据
 */
const generateTestPost = (overrides = {}) => {
  return {
    title: `Test Post ${generateRandomString(6)}`,
    content: `This is test content for post ${generateRandomString(8)}`,
    category: 'test',
    tags: ['test', 'automated'],
    ...overrides,
  };
};

/**
 * 生成测试评论数据
 */
const generateTestComment = (overrides = {}) => {
  return {
    content: `Test comment ${generateRandomString(8)}`,
    ...overrides,
  };
};

/**
 * 等待指定时间
 */
const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 重试函数
 */
const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await wait(delay * attempt);
      }
    }
  }

  throw lastError;
};

/**
 * 清理测试数据
 */
const cleanupTestData = async (models) => {
  const cleanupPromises = models.map((model) => {
    if (model && typeof model.deleteMany === 'function') {
      return model.deleteMany({}).catch((err) => {
        console.error(`Failed to cleanup ${model.modelName}:`, err);
      });
    }
    return Promise.resolve();
  });

  await Promise.all(cleanupPromises);
};

module.exports = {
  generateRandomString,
  generateRandomEmail,
  generateRandomUsername,
  generateTestUser,
  generateTestPost,
  generateTestComment,
  wait,
  retry,
  cleanupTestData,
};
