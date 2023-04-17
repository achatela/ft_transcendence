from node:18.15.0-alpine3.16

WORKDIR /app

COPY package.json package-lock.json /app

RUN npm install -g npm@9.5.0
RUN npm install

COPY . /app

EXPOSE 3333

CMD [ "npm", "start"]