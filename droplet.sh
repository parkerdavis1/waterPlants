#!/bin/bash
set -e
ssh-add -t 120s

echo "🚀 Running vite build..."
pnpm vite build

echo "↗️ Rsync build to droplet..."
rsync -a ./build droplet:/root/waterPlants/
rsync -a .env.prod droplet:/root/waterPlants/

ssh droplet '
    cd /root/waterPlants

    echo "⬇️ Pulling from github..."
    git pull

    echo "🔄 Rebuilding container..."
    docker compose -f /root/waterPlants/docker-compose.yml up --detach --build
'
echo "✅ Done!"

