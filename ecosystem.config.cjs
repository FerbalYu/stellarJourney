module.exports = {
  apps: [
    {
      name: 'my-app',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        LOG_LEVEL: 'info',
      },
      // Graceful shutdown settings
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      // Error handling
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Advanced options
      node_args: [
        '--max-old-space-size=450',
        '--gc-interval=100',
        '--optimize-for-size',
        '--memory-reducer',
      ],
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:username/repo.git',
      path: '/var/www/my-app',
      'pre-deploy-local': 'echo "Before deploy"',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'npm install -g pm2',
    },
  },
};
