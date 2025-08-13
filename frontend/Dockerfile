# Frontend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app/frontend

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy project files
COPY . .

# Accept build arguments for API URL
ARG NEXT_PUBLIC_API_URL=http://localhost:8810/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
