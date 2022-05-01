FROM node:18-alpine3.14

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g typescript

COPY . .

RUN tsc

EXPOSE 5000

CMD [ "node", "./build/index.js" ]
