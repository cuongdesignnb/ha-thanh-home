#!/usr/bin/env bash
# Deploy / cập nhật ha-thanh-home trên VPS aaPanel.
# Chạy ở thư mục repo (vd: /www/wwwroot/hathanh.cuongdesign.net).
#
# Usage:
#   bash scripts/deploy.sh           # pull + build + up
#   bash scripts/deploy.sh --migrate # kèm prisma migrate deploy
#   bash scripts/deploy.sh --seed    # kèm migrate + seed (chạy 1 lần)

set -euo pipefail

cd "$(dirname "$0")/.."

ENV_FILE=".env.docker.prod"
COMPOSE="docker compose --env-file ${ENV_FILE} -f docker-compose.prod.yml"

echo "==> git pull"
git pull --ff-only

echo "==> docker compose build + up"
${COMPOSE} up -d --build

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
  ${COMPOSE} exec -T api npx prisma migrate deploy
fi

if [[ " $* " == *" --seed "* ]]; then
  echo "==> npm run seed"
  ${COMPOSE} exec -T api npm run seed -w @hathanh/api
fi

echo "==> Trạng thái container:"
${COMPOSE} ps

echo "==> Hoàn tất."
