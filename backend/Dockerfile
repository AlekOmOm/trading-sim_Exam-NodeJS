FROM node:18-alpine

WORKDIR /usr/src

# Copy shared directory first
COPY shared/ ./shared/

# Set up backend app
WORKDIR /usr/src/app

COPY backend/package*.json ./

RUN npm install

COPY backend/ .

EXPOSE ${DEV_BACKEND_PORT}

CMD [ "npm", "start" ] 