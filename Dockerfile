# Use an official Node.js runtime as a parent image
FROM node:18.8-alpine as base

# Install necessary dependencies for Puppeteer and Chromium
RUN apk add --no-cache \
    libnss3 \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    wget \
    udev \
    bash \
    chromium

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

FROM base as builder

# Set the working directory
WORKDIR /home/node/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM base as runtime

# Set environment variables for production
ENV NODE_ENV=production
ENV PAYLOAD_CONFIG_PATH=dist/payload.config.js

# Set the working directory
WORKDIR /home/node/app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the built application
COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/build ./build

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]

