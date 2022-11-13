import expressSession from "express-session";

const ONE_HOUR = 1000 * 60 * 60;

export const session = expressSession({
  cookie: {
    maxAge: ONE_HOUR,
    sameSite: true
  },
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
});
