FROM node:18.16-bullseye-slim

VOLUME /app/logs

WORKDIR /app

COPY public public
COPY src src
COPY .eslintrc.json .
COPY vite.config.ts .
COPY package-lock.json .
COPY package.json .
COPY tsconfig.json .

RUN npm ci
RUN npm run validate

CMD ["node", "-r", "ts-node/register/transpile-only", "./src/app.ts"]
