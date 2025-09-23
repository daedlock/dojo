# Multi-stage build for React app
FROM oven/bun:alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_CTFD_API_URL
ARG VITE_DOJO_API_URL

# Set environment variables for Vite build
ENV VITE_CTFD_API_URL=$VITE_CTFD_API_URL
ENV VITE_DOJO_API_URL=$VITE_DOJO_API_URL

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies using bun
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
