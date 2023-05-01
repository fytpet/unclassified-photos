FROM node:18.16-bullseye-slim

VOLUME /app/logs
VOLUME /app/ssl

WORKDIR /app

COPY public public
COPY src src
COPY .eslintrc.json .
COPY jest.config.json .
COPY package-lock.json .
COPY package.json .
COPY tsconfig.json .

RUN npm ci
RUN npm run typecheck
RUN npm run lint
RUN npm run test

CMD ["node", "-r", "ts-node/register/transpile-only", "./src/app.ts"]
