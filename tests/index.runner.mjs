/**
 * 单元测试
 * 测试基础功能模块
 *
 * Run: node tests/index.runner.mjs
 */

import assert from 'node:assert';

import {
  isEmpty,
  deepClone,
  generateId,
  formatDate,
  safeParseJSON,
  isValidEmail,
  isValidPhone,
} from '../src/utils.js';

import { validateString, validateNumber, validateObject } from '../src/validator.js';

let passed = 0;
let failed = 0;

/**
 * 测试辅助函数
 */
function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

/**
 * 运行所有测试
 */
function runTests() {
  console.log('开始运行测试...\n');

  // 测试 isEmpty
  test('isEmpty - null', () => {
    assert.strictEqual(isEmpty(null), true);
  });

  test('isEmpty - undefined', () => {
    assert.strictEqual(isEmpty(undefined), true);
  });

  test('isEmpty - 空字符串', () => {
    assert.strictEqual(isEmpty(''), true);
  });

  test('isEmpty - 空格字符串', () => {
    assert.strictEqual(isEmpty('   '), true);
  });

  test('isEmpty - 空数组', () => {
    assert.strictEqual(isEmpty([]), true);
  });

  test('isEmpty - 空对象', () => {
    assert.strictEqual(isEmpty({}), true);
  });

  test('isEmpty - 有效字符串', () => {
    assert.strictEqual(isEmpty('hello'), false);
  });

  test('isEmpty - 有效数组', () => {
    assert.strictEqual(isEmpty([1, 2, 3]), false);
  });

  // 测试 deepClone
  test('deepClone - 基本类型', () => {
    assert.strictEqual(deepClone(42), 42);
    assert.strictEqual(deepClone('hello'), 'hello');
  });

  test('deepClone - 对象', () => {
    const original = { a: 1, b: { c: 2 } };
    const cloned = deepClone(original);
    assert.deepStrictEqual(cloned, original);
    assert.notStrictEqual(cloned, original);
    assert.notStrictEqual(cloned.b, original.b);
  });

  test('deepClone - 数组', () => {
    const original = [1, [2, 3]];
    const cloned = deepClone(original);
    assert.deepStrictEqual(cloned, original);
    assert.notStrictEqual(cloned, original);
    assert.notStrictEqual(cloned[1], original[1]);
  });

  test('deepClone - Date对象', () => {
    const date = new Date('2024-01-01');
    const cloned = deepClone(date);
    assert.strictEqual(cloned.getTime(), date.getTime());
    assert.notStrictEqual(cloned, date);
  });

  // 测试 generateId
  test('generateId - 生成唯一ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    assert.strictEqual(typeof id1, 'string');
    assert.strictEqual(id1.length > 0, true);
    assert.notStrictEqual(id1, id2);
  });

  // 测试 formatDate
  test('formatDate - 默认格式', () => {
    const date = new Date(2024, 0, 15, 10, 30, 45);
    const formatted = formatDate(date);
    assert.strictEqual(formatted.includes('2024'), true);
  });

  test('formatDate - 自定义格式', () => {
    const date = new Date(2024, 0, 15, 10, 30, 45);
    const formatted = formatDate(date, 'YYYY-MM-DD');
    assert.strictEqual(formatted, '2024-01-15');
  });

  test('formatDate - 无效日期', () => {
    const formatted = formatDate('invalid-date');
    assert.strictEqual(formatted, '');
  });

  // 测试 safeParseJSON
  test('safeParseJSON - 有效JSON', () => {
    const result = safeParseJSON('{"a":1}');
    assert.deepStrictEqual(result, { a: 1 });
  });

  test('safeParseJSON - 无效JSON', () => {
    const result = safeParseJSON('invalid', { default: true });
    assert.deepStrictEqual(result, { default: true });
  });

  // 测试 isValidEmail
  test('isValidEmail - 有效邮箱', () => {
    assert.strictEqual(isValidEmail('test@example.com'), true);
    assert.strictEqual(isValidEmail('user.name@domain.co.uk'), true);
  });

  test('isValidEmail - 无效邮箱', () => {
    assert.strictEqual(isValidEmail('invalid'), false);
    assert.strictEqual(isValidEmail('test@'), false);
    assert.strictEqual(isValidEmail('@domain.com'), false);
  });

  // 测试 isValidPhone
  test('isValidPhone - 有效手机号', () => {
    assert.strictEqual(isValidPhone('13800138000'), true);
    assert.strictEqual(isValidPhone('15912345678'), true);
  });

  test('isValidPhone - 无效手机号', () => {
    assert.strictEqual(isValidPhone('1234567890'), false);
    assert.strictEqual(isValidPhone('abc'), false);
    assert.strictEqual(isValidPhone('10000138000'), false);
  });

  // 测试验证器
  test('validateString - 必填验证', () => {
    const result = validateString('', { fieldName: '用户名', required: true });
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.errors.length > 0, true);
  });

  test('validateString - 长度验证', () => {
    const result = validateString('ab', { fieldName: '密码', minLength: 6 });
    assert.strictEqual(result.isValid, false);
  });

  test('validateString - 邮箱验证', () => {
    const result = validateString('invalid', { fieldName: '邮箱', email: true });
    assert.strictEqual(result.isValid, false);
  });

  test('validateNumber - 范围验证', () => {
    const result = validateNumber(25, { fieldName: '年龄', min: 0, max: 120 });
    assert.strictEqual(result.isValid, true);
  });

  test('validateNumber - 超出范围', () => {
    const result = validateNumber(200, { fieldName: '年龄', max: 120 });
    assert.strictEqual(result.isValid, false);
  });

  test('validateObject - 对象验证', () => {
    const result = validateObject(
      { name: '张三', age: 25 },
      {
        fields: {
          name: { type: 'string', required: true },
          age: { type: 'number', required: true },
        },
      }
    );
    assert.strictEqual(result.isValid, true);
  });

  // 输出测试结果
  console.log(`\n测试完成: ${passed} 通过, ${failed} 失败`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
