FROM node:24 as base

FROM base as development

WORKDIR /app
COPY package.json .
RUN apt update && npm install
COPY . .
EXPOSE 4000
CMD [ "npm","run", "start:dev" ]

FROM base as production

WORKDIR /app
COPY package.json .
RUN apt update && npm install -y --only=production
RUN npm install pm2 -g
COPY . .
RUN npm run build
EXPOSE 4000
CMD [ "pm2-runtime", "./ecosystem.config.js" ]