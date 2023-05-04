import RedisStore from "connect-redis";
import expressSession from "express-session";
import { redisClient } from "../redisClient";

const ONE_HOUR = 1000 * 60 * 60;

export const session = expressSession({
  cookie: {
    maxAge: ONE_HOUR,
  },
  name: "sessionId",
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: process.env.NODE_ENV === "production"
    ? new RedisStore({ client: redisClient })
    : undefined
});
