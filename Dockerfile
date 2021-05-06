FROM node:16

COPY . /casper/

VOLUME [ "/casper" ]
WORKDIR /casper

RUN npm install

RUN npm run build

CMD npm run start
