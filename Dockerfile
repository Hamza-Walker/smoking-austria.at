# Use Node.js 18 for the build container
ARG NODE_VERSION=18
ARG PAYLOAD_SECRET=0xCp+KlNVvjOzJljlnrPxgyA9gWdzobpDEbG1D/eQ1o
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

# Final stage for serving static files (if applicable)
FROM nginx:alpine
COPY --from=build /home/node/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

