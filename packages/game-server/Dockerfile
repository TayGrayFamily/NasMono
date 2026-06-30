# syntax=docker/dockerfile:1
# Build from monorepo root:
#   docker build -f packages/game-server/Dockerfile .

FROM node:24-alpine AS build
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/just-one ./packages/just-one
COPY packages/game-server ./packages/game-server

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter game-server build
# Deploy production dependencies with legacy flag for pnpm v10+ compatibility
RUN pnpm --filter game-server --prod deploy /app/prod --legacy

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy only the necessary files
COPY --from=build /app/packages/game-server/dist ./dist
COPY --from=build /app/packages/game-server/admin ./dist/admin
COPY --from=build /app/prod/node_modules ./node_modules
COPY --from=build /app/prod/package.json ./package.json

EXPOSE 3001
CMD ["node", "dist/index.js"]
