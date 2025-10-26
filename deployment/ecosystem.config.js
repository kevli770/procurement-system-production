/**
 * PM2 Ecosystem Configuration for Procurement System
 *
 * This configuration manages the Next.js application in production
 * with cluster mode, health checks, and auto-restart capabilities.
 *
 * Server Specs:
 * - 16GB RAM, 4 CPU cores
 * - Windows Server 2019
 * - Application Path: D:\procurement
 *
 * @see https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [{
    // Application Identity
    name: 'procurement-system',

    // Next.js Production Server
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: 'D:\\procurement',

    // Clustering Configuration
    // 3 instances for 4 CPU cores (leaving 1 core for system)
    instances: 3,
    exec_mode: 'cluster',

    // Auto-restart Configuration
    autorestart: true,
    max_restarts: 10,           // Max consecutive restarts
    min_uptime: '10s',          // Minimum uptime before considered stable
    max_memory_restart: '1G',   // Restart if memory exceeds 1GB

    // Startup Configuration
    wait_ready: true,           // Wait for app to be ready before marking as online
    listen_timeout: 10000,      // 10 seconds timeout for app to listen
    kill_timeout: 5000,         // 5 seconds for graceful shutdown
    shutdown_with_message: true,

    // Restart Strategy
    restart_delay: 4000,        // 4 seconds between restarts
    exp_backoff_restart_delay: 100, // Exponential backoff

    // Environment Variables
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Note: Other env vars loaded from .env file
    },

    // Logging Configuration
    error_file: 'D:\\logs\\procurement\\pm2-err.log',
    out_file: 'D:\\logs\\procurement\\pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // Log Rotation (optional - requires pm2-logrotate)
    // Install with: pm2 install pm2-logrotate
    log_type: 'json',

    // Monitoring
    // Note: For PM2 Plus monitoring, add your PM2_PUBLIC_KEY and PM2_SECRET_KEY
    // monit: true,

    // Advanced Options
    instance_var: 'INSTANCE_ID', // Available as env var to identify instance

    // Post-deployment hooks (optional)
    // post_update: ['npm run prisma:generate'],

    // Node.js Options
    node_args: [
      '--max-old-space-size=1024', // Limit heap to 1GB per instance
    ],

    // Time-based restart (optional)
    // cron_restart: '0 3 * * *',  // Restart daily at 3 AM
  }],

  // Deployment Configuration (optional - for remote deployment)
  // deploy: {
  //   production: {
  //     user: 'deployment-user',
  //     host: 'procurementapp',
  //     ref: 'origin/main',
  //     repo: 'git@github.com:your-org/procurement.git',
  //     path: 'D:\\procurement',
  //     'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
  //   }
  // }
};
