# Use Node.js 18 for both build and runtime stages
ARG NODE_VERSION=18
ARG PAYLOAD_SECRET

# Setup the build container
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /home/node

# Install dependencies
COPY package*.json .
RUN yarn install

# Copy the source files
COPY . .

# Build the application
RUN yarn build

# Setup the runtime container
FROM node:${NODE_VERSION}-alpine

WORKDIR /home/node

# Copy the built application
COPY --from=build /home/node /home/node

# Expose the service's port
EXPOSE 3000

# Ensure the secret key environment variable is available
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}

# Run the service
CMD ["yarn", "run", "serve"]
