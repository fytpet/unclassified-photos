FROM node:18.16-bullseye-slim

VOLUME /app/logs

WORKDIR /app

COPY node_modules node_modules
COPY public public
COPY src src
COPY .eslintrc.json .
COPY vite.config.ts .
COPY package-lock.json .
COPY package.json .
COPY tsconfig.json .

CMD ["node_modules/.bin/ts-node-transpile-only", "--esm", "./src/app.ts"]
