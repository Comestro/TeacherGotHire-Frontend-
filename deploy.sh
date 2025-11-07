#!/bin/bash
cd /var/www/ptpinstitute
echo "Pulling latest code..."
git pull origin main
echo "Installing dependencies..."
npm install --force         # or composer install / pip install -r requirements.txt
echo "Running build..."
yarn run build --force       # optional if frontend
echo "Restarting server..."
pm2 restart all     # or systemctl restart apache2 / nginx / gunicorn
echo "Deployment complete!"