#!/bin/bash
cd /var/www/ptpinstitute

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
yarn install --force

echo "Running build..."
node node_modules/vite/bin/vite.js build

echo "Restarting server..."
pm2 restart all

echo "Deployment complete!"
