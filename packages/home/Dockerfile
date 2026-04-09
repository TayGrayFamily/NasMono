# syntax=docker/dockerfile:1
# Build from monorepo root:
#   docker build -f packages/home/Dockerfile .

FROM node:24-alpine AS build
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/home ./packages/home

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter home build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Keep in sync with packages/home/package.json (express, dockerode)
RUN corepack enable && pnpm install --prod --filter=home --ignore-scripts

COPY --from=build /app/packages/home/dist ./dist
COPY --from=build /app/packages/home/dist-server ./dist-server
COPY --from=build /app/packages/home/package.json ./package.json

EXPOSE 80
CMD ["node", "dist-server/prod.js"]
