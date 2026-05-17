FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/api/package.json apps/api/package.json

RUN npm install --include=dev

COPY . .

RUN npm run build -w @hathanh/web

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "@hathanh/web"]
