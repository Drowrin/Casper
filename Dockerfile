FROM node:16

VOLUME [ "/casper/data" ]
WORKDIR /casper

COPY ./package.json package.json
COPY ./package-lock.json package-lock.json

RUN npm ci

COPY ./build/ build/

CMD npm run start
