#!/usr/bin/env bash
# Deploy / cập nhật ha-thanh-home trên VPS aaPanel.
# Chạy ở thư mục repo (vd: /www/wwwroot/ha-thanh-home).
#
# Usage:
#   bash scripts/deploy.sh           # pull + build + up
#   bash scripts/deploy.sh --migrate # kèm prisma migrate deploy
#   bash scripts/deploy.sh --seed    # kèm migrate + seed (chạy 1 lần)

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> git pull"
git pull --ff-only

echo "==> docker compose build + up"
docker compose --env-file .env.docker -f docker-compose.prod.yml up -d --build

if [[ " $* " == *" --migrate "* || " $* " == *" --seed "* ]]; then
  echo "==> chờ API healthy"
  for i in {1..30}; do
    if docker inspect --format='{{.State.Health.Status}}' hathanh-api 2>/dev/null | grep -q healthy; then
      echo "API healthy."
      break
    fi
    sleep 2
  done

  echo "==> prisma migrate deploy"
  docker compose --env-file .env.docker -f docker-compose.prod.yml exec -T api npx prisma migrate deploy
fi

if [[ " $* " == *" --seed "* ]]; then
  echo "==> npm run seed"
  docker compose --env-file .env.docker -f docker-compose.prod.yml exec -T api npm run seed -w @hathanh/api
fi

echo "==> Trạng thái container:"
docker compose --env-file .env.docker -f docker-compose.prod.yml ps

echo "==> Hoàn tất."
