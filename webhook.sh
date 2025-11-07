#!/bin/bash
cd /var/www/ptpinstitute || exit

echo "🔄 Pulling latest changes from GitHub..."
git pull origin main

echo "📦 Installing dependencies..."
npm install --force

echo "🧹 Building project..."
yarn run build --force

echo "♻️ Restarting app with PM2..."
pm2 restart all

echo "✅ Deployment completed at $(date)"
