FROM node:lts

EXPOSE 3333 3133

WORKDIR ~/transcendence/back
COPY package*.json .
COPY . .

RUN apt-get update \
	&& npm i -g @nestjs/cli

RUN npm install

ENTRYPOINT ["bash", "entrypoint.sh"]