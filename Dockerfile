# syntax=docker/dockerfile:1.7

FROM node:20.19-alpine AS base
WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN apk add --no-cache libc6-compat dumb-init \
  && corepack enable \
  && corepack prepare pnpm@10.30.3 --activate

FROM base AS deps
RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

FROM deps AS development
ENV NODE_ENV=development

COPY . .
USER node

CMD ["pnpm", "start:dev"]

FROM deps AS builder
ENV NODE_ENV=production

COPY . .
RUN pnpm build
RUN pnpm prune --prod

FROM base AS production
ENV NODE_ENV=production

RUN mkdir -p /app/src/generated /app/storage/public /app/storage/private /app/storage/avatars \
  && chown -R node:node /app

COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/public ./public

USER node
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
