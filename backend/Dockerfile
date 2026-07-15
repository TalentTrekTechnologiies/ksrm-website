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

# Uploaded media lives here. In a real deployment this MUST be a mounted volume
# (see docker-compose.prod.yml) or object storage, otherwise every redeploy
# wipes uploads.
#
# For the Render free-tier demo there is no persistent disk, so the committed
# media is baked into the image instead - that makes the existing images/PDFs
# survive restarts. Media uploaded at runtime is still lost on restart; that is
# only fixed by a volume or an S3/R2 StorageAdapter (see DEPLOYMENT.md).
RUN mkdir -p storage/media
COPY storage/media ./storage/media

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
