#!/bin/bash
cd /var/www/ptpinstitute || exit

echo "🔄 Pulling latest changes from GitHub..."
git pull origin main

echo "📦 Installing dependencies..."
yarn install --force

echo "🧹 Building project..."
node node_modules/vite/bin/vite.js build   # ← FIXED

echo "♻️ Restarting app with PM2..."
pm2 restart all

echo "✅ Deployment completed at $(date)"
