FROM node:24-alpine AS deps
WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@9.15.9 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build


FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/whalescale.sqlite

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

RUN mkdir -p /app/data && chown -R app:app /app

USER app
EXPOSE 3000

CMD ["node", "dist/main.js"]

