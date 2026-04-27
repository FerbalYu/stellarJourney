/**
 * 测试配置文件
 * 配置测试环境和全局设置
 */

// 全局测试超时设置
jest.setTimeout(30000);

// localStorage mock (Node.js 环境下不可用)
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// 全局 beforeAll
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-testing';
  process.env.PORT = '0'; // prevent port binding during tests
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
