FROM node:18 as build

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .
RUN npm run build


FROM node:18 as prod

WORKDIR /app

COPY package.json .
RUN npm install --omit=dev

COPY --from=build /app/build .

EXPOSE 3000

CMD ["/bin/sh", "-c", "node index.js"]
