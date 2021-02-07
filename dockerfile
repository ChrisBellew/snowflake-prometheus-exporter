FROM node:alpine

WORKDIR /home
COPY . .
RUN npm i
RUN npm run build

CMD ["npm", "run", "start"]