FROM node:21.6.2

ARG timezone 
ENV TIMEZONE=${timezone:-"America/Sao_Paulo"} 

RUN apt update 
WORKDIR /rinha24

COPY ./package.json ./package.json
COPY ./src/ ./src/

RUN npm install express pg

EXPOSE 3000

CMD node ./src/server.js