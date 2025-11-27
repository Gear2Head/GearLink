FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/media-service/package.json ./apps/media-service/
COPY libs/*/package.json ./libs/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @gearlink/media-service build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist/apps/media-service ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3005

CMD ["node", "dist/main.js"]
