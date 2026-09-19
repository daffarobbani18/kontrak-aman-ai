FROM node:22-alpine AS builder

WORKDIR /app/backend

# Copy only backend source to isolate from workspace
COPY backend .

# Install dependencies using npm
RUN npm install

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Generate Prisma client
RUN npm run db:generate

# Build backend
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app/backend

# Install openssl (required by Prisma)
RUN apk add --no-cache openssl

# Copy only backend source
COPY backend .

# Install production dependencies only using npm
RUN npm install --omit=dev

# Generate Prisma client for production
RUN npm run db:generate

# Copy built code
COPY --from=builder /app/backend/dist ./dist

# Expose port
EXPOSE 4000

# Start server
CMD ["npm", "start"]
