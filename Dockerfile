FROM node:7.7.2-alpine

WORKDIR /usr/app/es

COPY package.json .
RUN npm install --quiet

COPY . .
