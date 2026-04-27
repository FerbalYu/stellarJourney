/**
 * 测试数据固定装置
 * 提供测试中使用的静态测试数据
 */

/**
 * 有效的测试用户数据
 */
const validUsers = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    bio: 'Software developer',
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'AnotherPass456!',
    bio: 'Product manager',
  },
  {
    username: 'admin_user',
    email: 'admin@example.com',
    password: 'AdminPass789!',
    role: 'admin',
  },
];

/**
 * 无效的测试用户数据
 */
const invalidUsers = [
  {
    description: 'invalid email format',
    data: {
      username: 'testuser',
      email: 'not-an-email',
      password: 'SecurePass123!',
    },
  },
  {
    description: 'missing username',
    data: {
      email: 'test@example.com',
      password: 'SecurePass123!',
    },
  },
  {
    description: 'weak password - too short',
    data: {
      username: 'testuser',
      email: 'test@example.com',
      password: '123',
    },
  },
  {
    description: 'weak password - no numbers',
    data: {
      username: 'testuser',
      email: 'test@example.com',
      password: 'OnlyLetters',
    },
  },
  {
    description: 'weak password - no uppercase',
    data: {
      username: 'testuser',
      email: 'test@example.com',
      password: 'alllowercase123',
    },
  },
  {
    description: 'username too short',
    data: {
      username: 'ab',
      email: 'test@example.com',
      password: 'SecurePass123!',
    },
  },
];

/**
 * 有效的测试帖子数据
 */
const validPosts = [
  {
    title: 'Introduction to Node.js',
    content: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.",
    category: 'technology',
    tags: ['nodejs', 'javascript', 'backend'],
  },
  {
    title: 'Getting Started with React',
    content: 'React is a JavaScript library for building user interfaces.',
    category: 'technology',
    tags: ['react', 'javascript', 'frontend'],
  },
  {
    title: 'Healthy Eating Habits',
    content: 'A balanced diet is essential for maintaining good health.',
    category: 'health',
    tags: ['health', 'nutrition', 'lifestyle'],
  },
];

/**
 * 无效的测试帖子数据
 */
const invalidPosts = [
  {
    description: 'missing title',
    data: {
      content: 'Post content without title',
      category: 'test',
    },
  },
  {
    description: 'missing content',
    data: {
      title: 'Post without content',
      category: 'test',
    },
  },
  {
    description: 'title too short',
    data: {
      title: 'Hi',
      content: 'This is a post with a very short title',
      category: 'test',
    },
  },
  {
    description: 'content too short',
    data: {
      title: 'Valid Title',
      content: 'Short',
      category: 'test',
    },
  },
];

/**
 * 有效的测试评论数据
 */
const validComments = [
  {
    content: 'Great article! Very informative.',
  },
  {
    content: 'Thanks for sharing this knowledge.',
  },
  {
    content: 'I have a question about this topic.',
  },
];

/**
 * 无效的测试评论数据
 */
const invalidComments = [
  {
    description: 'empty content',
    data: {
      content: '',
    },
  },
  {
    description: 'missing content',
    data: {},
  },
];

/**
 * 测试分类数据
 */
const categories = [
  { name: 'technology', description: 'Tech related posts' },
  { name: 'health', description: 'Health and wellness' },
  { name: 'lifestyle', description: 'Lifestyle and hobbies' },
  { name: 'business', description: 'Business and entrepreneurship' },
  { name: 'education', description: 'Educational content' },
];

/**
 * 测试标签数据
 */
const tags = [
  'javascript',
  'nodejs',
  'react',
  'typescript',
  'python',
  'health',
  'fitness',
  'nutrition',
  'travel',
  'photography',
];

module.exports = {
  validUsers,
  invalidUsers,
  validPosts,
  invalidPosts,
  validComments,
  invalidComments,
  categories,
  tags,
};
