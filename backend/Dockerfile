# KSRM CMS backend - production image
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate
COPY --from=build /app/dist ./dist
COPY scripts ./scripts
# Uploaded media lives here - MUST be a mounted volume in production or
# every redeploy wipes uploads (see docker-compose.prod.yml / DEPLOYMENT.md)
RUN mkdir -p storage/media
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
