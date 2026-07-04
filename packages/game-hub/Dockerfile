# syntax=docker/dockerfile:1
# Build from monorepo root:
#   docker build -f packages/game-hub/Dockerfile .

FROM node:24-alpine AS build
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Copy workspace configuration and root package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package-specific package.json files
COPY packages/game-hub/package.json ./packages/game-hub/
COPY packages/just-one/package.json ./packages/just-one/
COPY packages/charades/package.json ./packages/charades/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Now copy the source code
COPY packages/game-hub ./packages/game-hub
COPY packages/just-one ./packages/just-one
COPY packages/charades ./packages/charades

RUN pnpm --filter game-hub build

FROM nginx:alpine AS runtime
COPY --from=build /app/packages/game-hub/dist /usr/share/nginx/html
# Copy our custom nginx config to route /api requests to the game-server container
COPY packages/game-hub/nginx.conf /etc/nginx/conf.d/default.conf
COPY packages/game-hub/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
