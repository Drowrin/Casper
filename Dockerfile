FROM node:16

VOLUME [ "/casper/data" ]
WORKDIR /casper

COPY ./build/ build/
COPY ./package.json package.json

RUN npm install

CMD npm run start
