#!/usr/bin/env node

/**
 * 测试运行脚本
 * 提供便捷的测试运行命令
 */

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const testType = args[0] || 'all';

const testCommands = {
  all: ['npm', ['test']], 
  unit: ['npm', ['test', '--', 'tests/unit']], 
  integration: ['npm', ['test', '--', 'tests/integration']], 
  e2e: ['npm', ['test', '--', 'tests/e2e']], 
  watch: ['npm', ['test', '--', '--watch']], 
  coverage: ['npm', ['test', '--', '--coverage']], 
  ci: ['npm', ['test', '--', '--ci']], 
};

const runTest = () => {
  const [command, params] = testCommands[testType] || testCommands.all;
  
  console.log(`\n🚀 Running ${testType} tests...\n`);
  
  const child = spawn(command, params, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    shell: true,
  });
  
  child.on('error', (error) => {
    console.error('Failed to start test runner:', error);
    process.exit(1);
  });
  
  child.on('close', (code) => {
    process.exit(code);
  });
};

const showHelp = () => {
  console.log(`
📋 Available test commands:

  node tests/run-tests.js all          - Run all tests
  node tests/run-tests.js unit          - Run unit tests only
  node tests/run-tests.js integration   - Run integration tests only
  node tests/run-tests.js e2e           - Run end-to-end tests only
  node tests/run-tests.js watch         - Run tests in watch mode
  node tests/run-tests.js coverage      - Run tests with coverage
  node tests/run-tests.js ci            - Run tests for CI environment

  npm test                             - Run all tests (default)
  npm run test:watch                   - Run tests in watch mode
  npm run test:coverage                - Run tests with coverage
  npm run test:unit                    - Run unit tests only
  npm run test:integration             - Run integration tests only
  npm run test:e2e                     - Run e2e tests only
`);
};

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

runTest();
