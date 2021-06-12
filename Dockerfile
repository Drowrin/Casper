FROM node:16

VOLUME [ "/casper/data" ]
WORKDIR /casper

COPY ./package.json package.json

RUN npm install

COPY ./build/ build/

CMD npm run start
