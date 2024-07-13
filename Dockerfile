# Use an official Node.js runtime as a parent image
FROM node:18.8-alpine as base

# Set the working directory
WORKDIR /home/node/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

FROM base as runtime

ENV NODE_ENV=production
ENV PAYLOAD_CONFIG_PATH=dist/payload.config.js
ENV PAYLOAD_SECRET=0xCp+KlNVvjOzJljlnrPxgyA9gWdzobpDEbG1D/eQ1o=

WORKDIR /home/node/app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built files from the builder stage
COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/build ./build

EXPOSE 3000

CMD ["node", "dist/server.js"]

