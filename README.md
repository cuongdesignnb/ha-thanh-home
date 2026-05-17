# Hà Thành Home

Production-oriented monorepo for the Hà Thành Home public website, admin dashboard, and NestJS API.

## Docker Quick Start

```bash
copy .env.docker.example .env.docker
npm run docker:check-ports
npm run docker:up
```

Default local URLs:

- Web: http://localhost:31873
- Admin: http://localhost:31874
- API health: http://localhost:31875/health
- MySQL: `127.0.0.1:31906`

The MySQL port is bound to `127.0.0.1` only. Uploads persist at `storage/uploads`, and database data persists in the Docker volume `mysql_data`.

## Docker Commands

```bash
npm run docker:check-ports
npm run docker:build
npm run docker:up
npm run docker:logs
npm run docker:down
```

## Docker Dev (Hot Reload)

Run this once (or after dependency changes):

```bash
npm run docker:dev:build
```

Run this for normal day-to-day development (no rebuild):

```bash
npm run docker:dev:up
```

Useful dev commands:

```bash
npm run docker:dev:logs
npm run docker:dev:down
```

In dev mode, `web` and `admin` use `next dev`, and `api` uses `tsx watch`, so file edits auto-reload without rebuilding images each time.

If a port is busy, update the matching variable in `.env.docker`:

- `WEB_PORT`
- `ADMIN_PORT`
- `API_PORT`
- `MYSQL_HOST_PORT`

## Default Admin

The API seed creates the default admin idempotently:

- Email: `admin@hathanhhome.vn`
- Password: `ChangeMe123!`

Change these through `.env.docker` before production.

## Nginx Reverse Proxy Targets

- `domain.com -> 127.0.0.1:31873`
- `admin.domain.com -> 127.0.0.1:31874`
- `api.domain.com -> 127.0.0.1:31875`

## Production Deploy (aaPanel)

Hướng dẫn đầy đủ: [docs/DEPLOY.md](docs/DEPLOY.md) — bao gồm cấu hình MySQL host, env production, Nginx 1-domain reverse proxy (`/`, `/admin`, `/api`, `/uploads`), SSL Let's Encrypt và script `scripts/deploy.sh`.

Quick prod commands (chạy trên VPS sau khi đã có `.env.docker`):

```bash
npm run docker:prod:up        # build + up containers
npm run docker:prod:migrate   # prisma migrate deploy
npm run docker:prod:seed      # seed lần đầu
npm run docker:prod:logs
```

## Non-Docker Production Notes

Docker Compose is the primary setup for this version. PM2/aaPanel scripts can still be used later if a non-Docker deployment is needed.
