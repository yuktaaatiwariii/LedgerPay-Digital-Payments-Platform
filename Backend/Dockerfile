FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies cleanly
RUN npm ci

# Copy rest of the backend code
COPY . .

# Expose the backend port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
