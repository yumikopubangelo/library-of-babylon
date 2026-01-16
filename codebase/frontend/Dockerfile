# Base image for building the frontend
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies with retry and timeout
RUN npm config set fetch-timeout 600000 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy build artifacts and dependencies
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/node_modules ./node_modules

# Copy the built application
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./tsconfig.json

# The archive folder needs to be mounted as a volume,
# so the API routes can access it.

EXPOSE 3000

# Start the Next.js application in production mode
CMD ["npm", "run", "start"]
