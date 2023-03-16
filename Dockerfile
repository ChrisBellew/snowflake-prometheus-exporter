FROM node:alpine

RUN adduser snowflakeexporter -D
USER snowflakeexporter

WORKDIR /home/snowflakeexporter
COPY . .
RUN npm i
RUN npm run build

CMD ["npm", "run", "start"]
