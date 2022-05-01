FROM node:18-alpine3.14

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g typescript

COPY . .

RUN tsc

RUN cp -r /app/code-run-scripts /app/build/code-run-scripts

EXPOSE 5000

CMD [ "node", "./build/index.js" ]
