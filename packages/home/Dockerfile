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

# Use pnpm deploy to isolate production dependencies for the home package.
# This avoids needing to run pnpm install in the runtime stage.
RUN pnpm --filter home --prod deploy /app/prod --legacy

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8888

# Copy the isolated production dependencies and package.json
COPY --from=build /app/prod/node_modules ./node_modules
COPY --from=build /app/prod/package.json ./package.json

# Copy the build artifacts from the home package
COPY --from=build /app/packages/home/dist ./dist
COPY --from=build /app/packages/home/dist-server ./dist-server
COPY --from=build /app/packages/home/config ./config

EXPOSE 8888
CMD ["node", "dist-server/prod.js"]
