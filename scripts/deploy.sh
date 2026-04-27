#!/bin/bash

# Deployment script for production server
set -euo pipefail

# Configuration
APP_NAME="my-app"
APP_DIR="/opt/${APP_NAME}"
BACKUP_DIR="/opt/backups/${APP_NAME}"
LOG_FILE="/var/log/${APP_NAME}-deploy.log"

echo "========================================"
echo "Starting deployment at $(date)"
echo "========================================"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error_exit "This script must be run as root"
fi

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Stop application
log "Stopping application..."
cd "${APP_DIR}" || error_exit "Cannot access ${APP_DIR}"

if command -v docker &> /dev/null; then
    docker-compose down || log "Docker compose stop failed"
elif command -v pm2 &> /dev/null; then
    pm2 stop ${APP_NAME} || log "PM2 stop failed"
fi

# Create backup of current version
if [[ -d "${APP_DIR}/dist" ]]; then
    BACKUP_NAME="${APP_NAME}-$(date +%Y%m%d-%H%M%S).tar.gz"
    log "Creating backup: ${BACKUP_NAME}"
    tar -czf "${BACKUP_DIR}/${BACKUP_NAME}" -C "${APP_DIR}" dist/ .env 2>/dev/null || true
fi

# Pull latest code
git pull origin main || error_exit "Git pull failed"

# Install dependencies
log "Installing dependencies..."
npm ci --production || npm install --production || error_exit "npm install failed"

# Build application
log "Building application..."
npm run build || error_exit "Build failed"

# Start application
log "Starting application..."

if command -v docker &> /dev/null; then
    docker-compose up -d --no-deps app || error_exit "Docker start failed"
elif command -v pm2 &> /dev/null; then
    pm2 startOrRestart ecosystem.config.js || error_exit "PM2 start failed"
    pm2 save || log "PM2 save failed"
fi

# Health check
log "Performing health check..."
sleep 5
for i in {1..10}; do
    if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
        log "Health check passed!"
        break
    fi
    if [[ $i -eq 10 ]]; then
        error_exit "Health check failed"
    fi
    sleep 2
done

# Cleanup old backups (keep last 10)
log "Cleaning up old backups..."
cd "${BACKUP_DIR}" || true
ls -t "${APP_NAME}"*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true

# Docker cleanup
if command -v docker &> /dev/null; then
    docker image prune -f > /dev/null 2>&1 || true
fi

log "========================================"
log "Deployment completed successfully at $(date)"
log "========================================"
