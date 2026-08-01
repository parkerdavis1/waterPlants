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

    echo "🏗️ Building image..."
    docker compose -f /root/waterPlants/docker-compose.yml build

    echo "🗄️ Running database migrations..."
    docker compose -f /root/waterPlants/docker-compose.yml run --rm waterplants pnpm db:migrate

    echo "🔄 Restarting container..."
    docker compose -f /root/waterPlants/docker-compose.yml up --detach
'
echo "✅ Done!"

