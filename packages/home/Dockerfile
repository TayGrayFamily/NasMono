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

RUN pnpm install --frozen-lockfile
RUN pnpm --filter home build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Keep in sync with packages/home/package.json (express, dockerode)
RUN npm install express@5.2.1 dockerode@4.0.10 --omit=dev --ignore-scripts

COPY --from=build /app/packages/home/dist ./dist
COPY --from=build /app/packages/home/dist-server ./dist-server

EXPOSE 80
CMD ["node", "dist-server/prod.js"]
