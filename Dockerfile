FROM node:alpine

RUN adduser snowflakeexporter -D
USER snowflakeexporter

WORKDIR /home/snowflakeexporter
COPY --chown=snowflakeexporter . .
RUN npm i
RUN npm run build

CMD ["npm", "run", "start"]
