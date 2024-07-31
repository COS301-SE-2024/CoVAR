FROM node:20 AS builder
WORKDIR /app
COPY ./package.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]