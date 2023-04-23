FROM node:18.16-bullseye-slim
WORKDIR /app
COPY . .

RUN npm ci
RUN npm run typecheck
RUN npm run lint
RUN npm run test

CMD ["node", "-r", "ts-node/register/transpile-only", "./src/app.ts"]
