FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/auth-service/package.json ./apps/auth-service/
COPY libs/*/package.json ./libs/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @gearlink/auth-service build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist/apps/auth-service ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/main.js"]
