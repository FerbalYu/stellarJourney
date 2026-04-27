/**
 * 数据库集成测试
 * 测试内存数据库的 CRUD 操作和持久化
 */

import db from '../../src/database.js';

describe('Database', () => {
  beforeEach(() => {
    db.clear();
  });

  it('should create a record with auto id', () => {
    const rec = db.create('users', { name: 'test', email: 'test@example.com' });
    expect(rec.id).toBeDefined();
    expect(rec.name).toBe('test');
    expect(rec.email).toBe('test@example.com');
    expect(rec.createdAt).toBeDefined();
  });

  it('should find record by id', () => {
    const created = db.create('users', { name: 'findme' });
    const found = db.findById('users', created.id);
    expect(found).toBeDefined();
    expect(found.name).toBe('findme');
  });

  it('should return null for non-existent id', () => {
    expect(db.findById('users', 'nonexistent')).toBeNull();
  });

  it('should find record by field', () => {
    db.create('users', { name: 'alice', email: 'alice@test.com' });
    db.create('users', { name: 'bob', email: 'bob@test.com' });
    const found = db.findByField('users', 'email', 'bob@test.com');
    expect(found.name).toBe('bob');
  });

  it('should update record', () => {
    const created = db.create('users', { name: 'old' });
    const updated = db.update('users', created.id, { name: 'new' });
    expect(updated.name).toBe('new');
    expect(db.findById('users', created.id).name).toBe('new');
  });

  it('should delete record', () => {
    const created = db.create('users', { name: 'temp' });
    expect(db.findById('users', created.id)).toBeDefined();
    db.delete('users', created.id);
    expect(db.findById('users', created.id)).toBeNull();
  });

  it('should list all records', () => {
    for (let i = 0; i < 5; i++) {
      db.create('users', { name: `user${i}` });
    }
    const all = db.findAll('users');
    expect(all.length).toBe(5);
  });

  it('should paginate results', () => {
    for (let i = 0; i < 15; i++) {
      db.create('posts', { title: `Post ${i}` });
    }
    const p1 = db.findAll('posts', { page: 1, limit: 10 });
    const p2 = db.findAll('posts', { page: 2, limit: 10 });
    expect(p1.items.length).toBe(10);
    expect(p2.items.length).toBe(5);
    expect(p1.total).toBe(15);
    expect(p1.totalPages).toBe(2);
  });

  it('should sort by field', () => {
    db.create('items', { name: 'c', value: 3 });
    db.create('items', { name: 'a', value: 1 });
    db.create('items', { name: 'b', value: 2 });
    const sorted = db.findAll('items', { orderBy: 'name asc' });
    expect(sorted[0].name).toBe('a');
    expect(sorted[2].name).toBe('c');
  });

  it('should filter in findAll', () => {
    db.create('users', { name: 'admin', role: 'admin' });
    db.create('users', { name: 'user1', role: 'user' });
    db.create('users', { name: 'user2', role: 'user' });
    const admins = db.findAll('users', { filter: (r) => r.role === 'admin' });
    expect(admins.length).toBe(1);
    expect(admins[0].name).toBe('admin');
  });

  it('should return stats', () => {
    db.create('users', { name: 'a' });
    db.create('users', { name: 'b' });
    db.create('posts', { title: 'p1' });
    const s = db.stats();
    expect(s.collections.users).toBe(2);
    expect(s.collections.posts).toBe(1);
  });

  it('should clear specific collection', () => {
    db.create('users', { name: 'a' });
    db.create('posts', { title: 'p' });
    db.clear('users');
    expect(db.findAll('users').length).toBe(0);
    expect(db.findAll('posts').length).toBe(1);
  });

  it('should support multiple independent collections', () => {
    const u1 = db.create('users', { name: 'u1' });
    const p1 = db.create('posts', { title: 'p1' });
    expect(db.findById('users', u1.id).name).toBe('u1');
    expect(db.findById('posts', p1.id).title).toBe('p1');
  });
});
