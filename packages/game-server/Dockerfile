# syntax=docker/dockerfile:1
# Build from monorepo root:
#   docker build -f packages/game-server/Dockerfile .

FROM node:24-alpine AS build
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/game-server ./packages/game-server
COPY packages/game-hub ./packages/game-hub
# Dependencies for the server
COPY packages/home ./packages/home

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter game-server build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN npm install express@5.2.1 socket.io@4.8.1 pg@8.13.3 dotenv@16.0.0 --omit=dev --ignore-scripts

COPY --from=build /app/packages/game-server/dist ./dist
COPY --from=build /app/packages/game-server/node_modules ./node_modules
# Ensure .env can be loaded if necessary by mounting or copying
# COPY .env .env 

EXPOSE 3001
CMD ["node", "dist/index.js"]
