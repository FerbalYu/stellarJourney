module.exports = {
  testEnvironment: 'node',
  
  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
  ],

  // 排除非 Jest 测试
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/index.runner',
  ],
  
  // 收集覆盖率的文件
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/__tests__/**',
    '!src/index.js',
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // 报告格式
  coverageReporters: ['text', 'lcov', 'clover'],
  
  // 测试输出目录
  coverageDirectory: 'coverage',

  // 额外断言库
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js', '<rootDir>/tests/utils/test-helpers.cjs'],
  
  // 测试超时时间（毫秒）
  testTimeout: 30000,
  
  // 是否在测试失败时显示完整错误堆栈
  verbose: true,
  
  // 并行执行
  maxWorkers: '50%',
  
  // 清除模拟调用
  clearMocks: true,
  
  // 报告测试用例运行时长
  fakeTimers: {
    enableGlobally: false,
  },
  
  // 失败时立即停止
  bail: false,
  
  // 模块路径别名
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  
  // 转换文件
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // 不将 .js 作为原生 ESM 处理，交给 babel-jest
  extensionsToTreatAsEsm: [],
  
  // 忽略转换的文件
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  
  // 代码覆盖率忽略模式
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/coverage/',
  ],
};
