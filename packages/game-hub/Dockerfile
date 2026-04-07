# syntax=docker/dockerfile:1
# Build from monorepo root:
#   docker build -f packages/game-hub/Dockerfile .

FROM node:24-alpine AS build
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/just-one ./packages/just-one
COPY packages/game-hub ./packages/game-hub

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter game-hub build

FROM nginx:alpine AS runtime
COPY --from=build /app/packages/game-hub/dist /usr/share/nginx/html
# Copy our custom nginx config to route /api requests to the game-server container
COPY packages/game-hub/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
