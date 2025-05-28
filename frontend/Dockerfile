FROM node:18-alpine

WORKDIR /usr/src

# Copy shared directory first
COPY shared/ ./shared/

# Set up frontend app
WORKDIR /usr/src/app

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ .

EXPOSE ${DEV_FRONTEND_PORT}

# Assuming 'dev' script in package.json starts the development server
CMD [ "npm", "run", "dev", "--", "--host" ] 