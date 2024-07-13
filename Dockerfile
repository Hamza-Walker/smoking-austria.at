# Use an official Node.js runtime as a parent image
FROM node:18.8-alpine as base

# Set the working directory
WORKDIR /home/node/app

# Copy package.json and yarn.lock
COPY package*.json ./

COPY . .
RUN npm install
RUN npm run build

FROM base as runtime

ENV NODE_ENV=production
ENV PAYLOAD_CONFIG_PATH=dist/payload.config.js
ENV PAYLOAD_SECRET=0xCp+KlNVvjOzJljlnrPxgyA9gWdzobpDEbG1D/eQ1o=

WORKDIR /home/node/app
COPY package*.json  ./
COPY yarn.lock ./

RUN npm install --only=production
COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/build ./build

EXPOSE 3000

CMD ["node", "dist/server.js"]

