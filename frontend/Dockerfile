# ----------------------------------------------------------------------------
# Frontend Dockerfile.
#
# Development mode image — `npm run dev`. For production, build `next start`
# on the host (Vercel takes care of this in practice).
# ----------------------------------------------------------------------------

FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
