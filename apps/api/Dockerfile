FROM node:20-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json

RUN npm install --include=dev

COPY . .

RUN npm run prisma:generate -w @hathanh/api
RUN npm run build -w @hathanh/api

ENV NODE_ENV=production

EXPOSE 4000

CMD ["sh", "-c", "npm run prisma:deploy -w @hathanh/api && npm run start:prod -w @hathanh/api"]
