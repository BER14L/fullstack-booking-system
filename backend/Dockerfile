# ----------------------------------------------------------------------------
# Multi-stage Dockerfile for the SmartReserve backend.
# Stage 1 installs deps and compiles TS; Stage 2 ships a slim runtime image.
# ----------------------------------------------------------------------------

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client against the committed schema before compiling TS.
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Only copy what the runtime actually needs.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
EXPOSE 4000
# `migrate deploy` is idempotent, so it's safe to run at every start in prod.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
