/**
 * 数据库模块
 * 内存存储 + localStorage 持久化支持
 * 提供 CRUD 操作和简单的查询接口
 */

class Database {
  constructor(name = 'default') {
    this.name = name;
    this._store = new Map();
    this._indices = new Map();
    this._autoIncrement = 1;
    this._storageKey = `db_${name}`;
  }

  /**
   * 创建记录
   * @param {string} collection - 集合名称
   * @param {Object} data - 数据
   * @returns {Object} 包含 id 的完整记录
   */
  create(collection, data) {
    const id = `rec_${this._autoIncrement++}`;
    const record = {
      id,
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!this._store.has(collection)) {
      this._store.set(collection, new Map());
    }
    this._store.get(collection).set(id, record);

    // 维护索引
    this._indexRecord(collection, record);

    return { ...record };
  }

  /**
   * 查找单条记录
   * @param {string} collection
   * @param {string} id
   */
  findById(collection, id) {
    const coll = this._store.get(collection);
    if (!coll) return null;
    const record = coll.get(id);
    return record ? { ...record } : null;
  }

  /**
   * 按字段查找
   * @param {string} collection
   * @param {string} field
   * @param {*} value
   */
  findByField(collection, field, value) {
    const results = this.findAll(collection, { filter: (r) => r[field] === value });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * 查找所有记录
   * @param {string} collection
   * @param {Object} options - { filter, page, limit, orderBy }
   */
  findAll(collection, options = {}) {
    const coll = this._store.get(collection);
    if (!coll) return [];

    let results = Array.from(coll.values()).map((r) => ({ ...r }));

    if (options.filter) {
      results = results.filter(options.filter);
    }

    if (options.orderBy) {
      const [field, dir] = options.orderBy.split(' ');
      results.sort((a, b) => {
        if (a[field] < b[field]) return dir === 'desc' ? 1 : -1;
        if (a[field] > b[field]) return dir === 'desc' ? -1 : 1;
        return 0;
      });
    }

    if (options.page && options.limit) {
      const start = (options.page - 1) * options.limit;
      const end = start + options.limit;
      return {
        items: results.slice(start, end),
        total: results.length,
        totalPages: Math.ceil(results.length / options.limit),
        page: options.page,
      };
    }

    return results;
  }

  /**
   * 更新记录
   * @param {string} collection
   * @param {string} id
   * @param {Object} data
   */
  update(collection, id, data) {
    const coll = this._store.get(collection);
    if (!coll || !coll.has(id)) return null;

    const oldRecord = coll.get(id);
    const updated = {
      ...oldRecord,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    coll.set(id, updated);
    return { ...updated };
  }

  /**
   * 删除记录
   * @param {string} collection
   * @param {string} id
   */
  delete(collection, id) {
    const coll = this._store.get(collection);
    if (!coll) return false;
    const existed = coll.has(id);
    coll.delete(id);
    return existed;
  }

  /**
   * 清空集合
   */
  clear(collection) {
    if (collection) {
      this._store.delete(collection);
    } else {
      this._store.clear();
    }
  }

  /**
   * 获取统计信息
   */
  stats() {
    const collections = {};
    for (const [name, coll] of this._store) {
      collections[name] = coll.size;
    }
    return {
      name: this.name,
      collections,
      total: Array.from(this._store.values()).reduce((sum, c) => sum + c.size, 0),
    };
  }

  /**
   * 持久化到 localStorage
   */
  save() {
    try {
      const data = {};
      for (const [name, coll] of this._store) {
        data[name] = Array.from(coll.entries());
      }
      localStorage.setItem(this._storageKey, JSON.stringify(data));
      return true;
    } catch (_e) {
      return false;
    }
  }

  /**
   * 从 localStorage 恢复
   */
  load() {
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (!raw) return false;

      const data = JSON.parse(raw);
      for (const [name, entries] of Object.entries(data)) {
        this._store.set(name, new Map(entries));
        if (entries.length > 0) {
          const maxId = Math.max(
            ...entries.map(([id]) => parseInt(id.replace('rec_', ''), 10))
          );
          this._autoIncrement = Math.max(this._autoIncrement, maxId + 1);
        }
      }
      return true;
    } catch (_e) {
      return false;
    }
  }

  _indexRecord(_collection, _record) {
    // 预留索引维护接口
  }
}

// 单例实例
const db = new Database('stellarJourney');

export default db;
export { Database };
