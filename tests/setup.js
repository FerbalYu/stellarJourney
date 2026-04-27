/**
 * 测试配置文件
 * 配置测试环境和全局设置
 */

// 全局测试超时设置
jest.setTimeout(30000);

// 全局 beforeAll
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-testing';
});

// 全局 afterAll
afterAll(async () => {
  jest.clearAllMocks();
});

// 全局 beforeEach
beforeEach(async () => {
  jest.resetAllMocks();
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 自定义匹配器
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  toContainIgnoreCase(received, unexpected) {
    const pass = received.toLowerCase().includes(unexpected.toLowerCase());
    if (pass) {
      return {
        message: () => `expected ${received} not to contain ${unexpected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to contain ${unexpected}`,
        pass: false,
      };
    }
  },
});
