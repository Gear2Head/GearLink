FROM node:20-alpine

# Install ffmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/worker-media/package.json ./apps/worker-media/
COPY libs/*/package.json ./libs/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @gearlink/worker-media build

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
