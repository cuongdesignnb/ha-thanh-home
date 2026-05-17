FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_WEB_URL=http://localhost:31873
ARG NEXT_PUBLIC_API_URL=http://localhost:31875/api
ARG ADMIN_BASE_PATH=
ARG NEXT_PUBLIC_ADMIN_BASE_PATH=/admin
ENV NEXT_PUBLIC_WEB_URL=$NEXT_PUBLIC_WEB_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV ADMIN_BASE_PATH=$ADMIN_BASE_PATH
ENV NEXT_PUBLIC_ADMIN_BASE_PATH=$NEXT_PUBLIC_ADMIN_BASE_PATH

COPY package.json package-lock.json* ./
COPY apps/admin/package.json apps/admin/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json

RUN npm install --include=dev

COPY . .

RUN npm run build -w @hathanh/admin

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "run", "start", "-w", "@hathanh/admin"]
