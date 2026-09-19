FROM node:22-alpine AS builder

WORKDIR /app/backend-ai

# Install native dependencies for Canvas/OCR
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev libjpeg-turbo-dev giflib-dev

# Copy only backend-ai source to isolate from workspace
COPY backend-ai .

# Install dependencies using npm
RUN npm install

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Build backend-ai
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app/backend-ai

# Install native dependencies required at runtime
RUN apk add --no-cache cairo pango libjpeg-turbo giflib

# Copy only backend-ai source
COPY backend-ai .

# Install production dependencies only using npm
RUN npm install --omit=dev

# Copy built code
COPY --from=builder /app/backend-ai/dist ./dist

# Expose port (if applicable)
EXPOSE 8000

# Start server
CMD ["node", "dist/main"]
