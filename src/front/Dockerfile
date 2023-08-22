FROM node:lts

RUN apt-get update

WORKDIR ~/transcendence/front

COPY package*.json .
COPY . .
RUN npm install

EXPOSE 3133

ENTRYPOINT ["npm", "start"]