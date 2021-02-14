FROM node:alpine

WORKDIR /home
COPY . .
RUN ls
RUN npm i
RUN npm run build

CMD ["npm", "run", "start"]