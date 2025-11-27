FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/notification-service/package.json ./apps/notification-service/
COPY libs/*/package.json ./libs/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @gearlink/notification-service build

ENV NODE_ENV=production

EXPOSE 3006

CMD ["node", "dist/apps/notification-service/main.js"]
