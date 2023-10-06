import RedisStore from "connect-redis";
import expressSession from "express-session";
import { redisClient } from "../redisClient.js";

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

export const session = expressSession({
  cookie: {
    maxAge: ONE_YEAR,
  },
  name: "sessionId",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: process.env.NODE_ENV === "production"
    ? new RedisStore({ client: redisClient })
    : undefined
});
