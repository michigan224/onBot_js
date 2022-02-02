# syntax=docker/dockerfile:1

FROM node:17.0.1

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD [ "node", "deploy-commands.js"]
CMD [ "node", "index.js" ]