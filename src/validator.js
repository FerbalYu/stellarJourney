/**
 * 验证器模块
 * 提供数据验证功能
 */

import { isValidEmail, isValidPhone, isEmpty } from './utils.js';

/**
 * 验证结果类
 */
class ValidationResult {
  constructor() {
    this.errors = [];
    this.isValid = true;
  }

  addError(field, message) {
    this.errors.push({ field, message });
    this.isValid = false;
  }

  getErrors() {
    return this.errors;
  }

  getErrorMessages() {
    return this.errors.map((e) => `${e.field}: ${e.message}`);
  }
}

/**
 * 字符串验证规则
 * @param {string} value - 待验证的值
 * @param {Object} rules - 验证规则
 * @returns {ValidationResult}
 */
function validateString(value, rules = {}) {
  const result = new ValidationResult();
  const fieldName = rules.fieldName || 'field';

  if (rules.required && isEmpty(value)) {
    result.addError(fieldName, '此字段为必填项');
    return result;
  }

  if (value != null) {
    if (rules.minLength && value.length < rules.minLength) {
      result.addError(fieldName, `最小长度为 ${rules.minLength} 个字符`);
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      result.addError(fieldName, `最大长度为 ${rules.maxLength} 个字符`);
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      result.addError(fieldName, '格式不正确');
    }

    if (rules.email && !isValidEmail(value)) {
      result.addError(fieldName, '邮箱格式不正确');
    }

    if (rules.phone && !isValidPhone(value)) {
      result.addError(fieldName, '手机号格式不正确');
    }
  }

  return result;
}

/**
 * 数字验证规则
 * @param {number} value - 待验证的值
 * @param {Object} rules - 验证规则
 * @returns {ValidationResult}
 */
function validateNumber(value, rules = {}) {
  const result = new ValidationResult();
  const fieldName = rules.fieldName || 'field';

  if (rules.required && (value === undefined || value === null)) {
    result.addError(fieldName, '此字段为必填项');
    return result;
  }

  if (value != null) {
    if (typeof value !== 'number' || isNaN(value)) {
      result.addError(fieldName, '必须是有效的数字');
      return result;
    }

    if (rules.min !== undefined && value < rules.min) {
      result.addError(fieldName, `最小值为 ${rules.min}`);
    }

    if (rules.max !== undefined && value > rules.max) {
      result.addError(fieldName, `最大值为 ${rules.max}`);
    }
  }

  return result;
}

/**
 * 对象验证规则
 * @param {Object} value - 待验证的对象
 * @param {Object} schema - 验证模式
 * @returns {ValidationResult}
 */
function validateObject(value, schema = {}) {
  const result = new ValidationResult();

  if (schema.required && isEmpty(value)) {
    result.addError('object', '此对象为必填项');
    return result;
  }

  if (value != null && typeof value === 'object') {
    for (const field in schema.fields) {
      const fieldRules = { ...schema.fields[field], fieldName: field };
      const fieldValue = value[field];

      if (fieldRules.type === 'string') {
        const fieldResult = validateString(fieldValue, fieldRules);
        if (!fieldResult.isValid) {
          fieldResult.errors.forEach((e) => result.addError(e.field, e.message));
        }
      } else if (fieldRules.type === 'number') {
        const fieldResult = validateNumber(fieldValue, fieldRules);
        if (!fieldResult.isValid) {
          fieldResult.errors.forEach((e) => result.addError(e.field, e.message));
        }
      }
    }
  }

  return result;
}

export { ValidationResult, validateString, validateNumber, validateObject };
