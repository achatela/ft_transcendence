FROM node:lts

RUN apt-get update

WORKDIR /transcendence/front

COPY . .

RUN npm install

EXPOSE 3133

ENTRYPOINT ["npm", "start"]