# Stage 1: Build the frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies cleanly
RUN npm ci

# Copy the rest of the application
COPY . .

# Pass VITE_API_URL as a build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the frontend
RUN npm run build

# Stage 2: Serve the frontend with Nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config for SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
