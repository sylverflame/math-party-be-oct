# Stage 1 - Build
FROM node:22.20.0-alpine AS builder

WORKDIR /app

COPY package*.json .
RUN npm install
RUN npm install typescript@5.9.3

COPY . .
RUN npm run build

# Stage 2 — Runtime
FROM node:22.20.0-alpine

WORKDIR /app

# Copy only what the built app needs
COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.js"]
