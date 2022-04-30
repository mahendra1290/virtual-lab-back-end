FROM node:18-alpine3.14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN tsc

EXPOSE 5000

CMD [ "node", "build/index.js" ]
